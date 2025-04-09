package services

import (
	"context"

	"github.com/hibiken/asynq"
)

const (
	QueueCritical = "critical"
	QueueDefault  = "default"
	QueueLow      = "low"

	From = "CONNECT"

	PaymentSMS = "Hello {{.Name}}, we have received your payment of KES {{.Paid}} on {{.PaidDate}}. Your new balance is KES {{.Loaned}}. Thank you!"
)

type RedisConfig struct {
	Address  string
	Password string
	DB       int
}

type WorkerService interface {
	// processes
	StartProcessor() error
	StopProcessor()

	DistributeTaskSendSMS(ctx context.Context, payload SendSMSPayload, opt ...asynq.Option) error
}

type SendSMSPayload struct {
	PhoneNumbers []string `json:"phone_numbers"`
	Messages     []string `json:"messages"`
	RefIds       []string `json:"ref_ids"`
}
