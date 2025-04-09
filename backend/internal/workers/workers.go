package workers

import (
	"context"

	"github.com/EmilioCliff/jonche/internal/postgres"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/hibiken/asynq"
)

var _ services.WorkerService = (*WorkerServiceImpl)(nil)

type WorkerServiceImpl struct {
	distributor *TaskDistributor
	processor   *TaskProcessor
}

func NewWorkerService(
	redisConfig services.RedisConfig,
	repo *postgres.PostgresRepo,
	config pkg.Config,
) services.WorkerService {
	redisOpt := asynq.RedisClientOpt{
		Addr:     redisConfig.Address,
		DB:       redisConfig.DB,
		Password: redisConfig.Password,
	}

	return &WorkerServiceImpl{
		distributor: NewTaskDistributor(redisOpt),
		processor:   NewTaskProcessor(redisOpt, repo, config),
	}
}

func (w *WorkerServiceImpl) StartProcessor() error {
	return w.processor.Start()
}

func (w *WorkerServiceImpl) StopProcessor() {
	w.processor.Stop()
}

func (w *WorkerServiceImpl) DistributeTaskSendSMS(
	ctx context.Context,
	payload services.SendSMSPayload,
	opt ...asynq.Option,
) error {
	return w.distributor.DistributeTaskSendSMS(ctx, payload, opt...)
}
