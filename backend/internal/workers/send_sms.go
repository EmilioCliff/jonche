package workers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

const (
	SendSMSTask = "task:send_sms"
)

type tiaraSMSPayload struct {
	From        string `json:"from"`
	To          string `json:"to"`
	Message     string `json:"message"`
	RefId       string `json:"refId"`
	MessageType string `json:"messageType"`
}

type tiaraSMSResponse struct {
	Cost       string `json:"cost,omitempty"`
	Mnc        string `json:"mnc,omitempty"`
	Balance    string `json:"balance,omitempty"`
	MsgId      string `json:"msgId,omitempty"`
	To         string `json:"to,omitempty"`
	Mcc        string `json:"mcc,omitempty"`
	Desc       string `json:"desc,omitempty"`
	Status     string `json:"status"`
	StatusCode string `json:"statusCode,omitempty"`

	Timestamp string `json:"timestamp,omitempty"`
	Error     string `json:"error,omitempty"`
	Message   string `json:"message,omitempty"`
	Path      string `json:"path,omitempty"`
}

func (distributor *TaskDistributor) DistributeTaskSendSMS(
	ctx context.Context,
	payload services.SendSMSPayload,
	opt ...asynq.Option,
) error {
	if len(payload.Messages) != len(payload.PhoneNumbers) {
		return pkg.Errorf(pkg.INVALID_ERROR, "mesages and phonumbers should be of the same length")
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to marshal payload: %s", err.Error())
	}

	task := asynq.NewTask(SendSMSTask, jsonPayload, opt...)
	_, err = distributor.client.EnqueueContext(ctx, task)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to enqueue task: %s", err.Error())
	}

	return nil
}

func (processor *TaskProcessor) ProcessTaskSendSMS(ctx context.Context, task *asynq.Task) error {
	var payload services.SendSMSPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to unmarshal payload: %s", err.Error())
	}

	for i := range payload.PhoneNumbers {
		requestBody := tiaraSMSPayload{
			From:        services.From,
			To:          setPhoneNumber(payload.PhoneNumbers[i]),
			Message:     payload.Messages[i],
			RefId:       payload.RefIds[i],
			MessageType: "2",
		}
		jsonBody, err := json.Marshal(requestBody)

		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed marshaling body: %s", err.Error())
		}

		req, err := http.NewRequest(
			http.MethodPost,
			// processor.config.TIARA_ENDPOINT,
			"",
			bytes.NewBuffer(jsonBody),
		)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to create request: %s", err.Error())
		}

		req.Header.Set("Authorization", "Bearer "+processor.config.TIARA_API_KEY)
		req.Header.Add("Content-Type", "application/json")

		client := &http.Client{}

		resp, err := client.Do(req)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "failed sending request: %s", err.Error())
		}
		defer resp.Body.Close()

		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "error reading resp body: %s", err.Error())
		}

		var tiaraRsp tiaraSMSResponse
		if err := json.Unmarshal(responseBody, &tiaraRsp); err != nil {
			return pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error unmarshaling resp body: %s",
				err.Error(),
			)
		}

		if resp.StatusCode == http.StatusOK {
			par := repository.UpdateSMS{
				RefID:       uuid.MustParse(payload.RefIds[0]),
				Description: &tiaraRsp.Desc,
				Cost:        &tiaraRsp.Cost,
			}

			if err := processor.repo.SMSRepo.UpdateSMS(ctx, &par); err != nil {
				return err
			}
		} else {
			pa := repository.UpdateSMS{
				RefID:       uuid.MustParse(payload.RefIds[0]),
				Description: &tiaraRsp.Desc,
				Cost:        &tiaraRsp.Error, // just checking
			}
			if err := processor.repo.SMSRepo.UpdateSMS(ctx, &pa); err != nil {
				return err
			}
		}

	}

	return nil
}

func setPhoneNumber(phoneNumber string) string {
	re := regexp.MustCompile(`\D`)
	phoneNumber = re.ReplaceAllString(phoneNumber, "")

	if strings.HasPrefix(phoneNumber, "2547") {
		return phoneNumber
	}

	if strings.HasPrefix(phoneNumber, "07") {
		return "254" + phoneNumber[1:]
	}

	if strings.HasPrefix(phoneNumber, "7") {
		return "254" + phoneNumber
	}

	return phoneNumber
}
