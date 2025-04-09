package workers

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/EmilioCliff/jonche/internal/postgres"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/hibiken/asynq"
)

type TaskProcessor struct {
	server *asynq.Server
	repo   *postgres.PostgresRepo
	config pkg.Config
}

func NewTaskProcessor(
	redisOpt asynq.RedisClientOpt,
	repo *postgres.PostgresRepo,
	config pkg.Config,
) *TaskProcessor {
	server := asynq.NewServer(redisOpt, asynq.Config{
		Queues: map[string]int{
			services.QueueCritical: 10,
			services.QueueDefault:  5,
			services.QueueLow:      2,
		},
		RetryDelayFunc: CustomRetryDelayFunc,
		ErrorHandler:   asynq.ErrorHandlerFunc(ReportError),
		LogLevel:       asynq.WarnLevel,
	})

	return &TaskProcessor{server: server, repo: repo, config: config}
}

func (processor *TaskProcessor) Start() error {
	mux := asynq.NewServeMux()

	mux.HandleFunc(SendSMSTask, processor.ProcessTaskSendSMS)

	return processor.server.Start(mux)
}

func (processor *TaskProcessor) Stop() {
	processor.server.Shutdown()
	log.Println("Task processor stopped successfully.")
}

func CustomRetryDelayFunc(_ int, _ error, _ *asynq.Task) time.Duration {
	return 2 * time.Second
}

func ReportError(ctx context.Context, task *asynq.Task, err error) {
	retried, _ := asynq.GetRetryCount(ctx)
	maxRetry, _ := asynq.GetMaxRetry(ctx)
	if retried >= maxRetry {
		err = fmt.Errorf("retry exhausted for task %s: %w", task.Type(), err)
	}
	log.Println(err)
	// log it or something
	// errorReportingService.Notify(err)
}
