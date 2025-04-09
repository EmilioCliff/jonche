package postgres

import (
	"context"
	"log"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.SMSRepository = (*SMSRepository)(nil)

type SMSRepository struct {
	db      *Store
	queries generated.Querier
}

func NewSMSRepository(db *Store) *SMSRepository {
	return &SMSRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (s *SMSRepository) CreateSMS(
	ctx context.Context,
	sms *repository.SMS,
	ids []uint32,
	afterCreate func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
) error {
	err := s.db.ExecTx(ctx, func(q *generated.Queries) error {
		var smsTmplParams []pkg.CustomerTemplateParams
		var phoneNumbers []string
		var refIds []string
		for _, id := range ids {
			refId := uuid.NewString()
			_, err := q.CreateSMS(ctx, generated.CreateSMSParams{
				CustomerID: int64(id),
				Message:    sms.Message,
				Type:       "manual",
				RefID:      refId,
			})
			if err != nil {
				if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
					return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
				}

				return pkg.Errorf(pkg.INTERNAL_ERROR, "error creating sms: %s", err.Error())
			}
			customer, err := q.GetCustomer(ctx, generated.GetCustomerParams{
				ID: pgtype.Int8{
					Valid: true,
					Int64: int64(id),
				},
			})
			if err != nil {
				if err == pgx.ErrNoRows {
					return pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
				}

				return pkg.Errorf(pkg.INTERNAL_ERROR, "error getting customer: %s", err.Error())
			}

			smsTmplParams = append(smsTmplParams, pkg.CustomerTemplateParams{
				Name:        customer.Name,
				Loaned:      numericToFloat64(customer.Loaned),
				PhoneNumber: customer.PhoneNumber,
			})

			phoneNumbers = append(phoneNumbers, customer.PhoneNumber)
			refIds = append(refIds, refId)
		}

		messages, err := pkg.GenerateMessages(sms.Message, smsTmplParams)
		if err != nil {
			return err
		}

		p := services.SendSMSPayload{
			Messages:     messages,
			PhoneNumbers: phoneNumbers,
			RefIds:       refIds,
		}

		opts := []asynq.Option{
			asynq.MaxRetry(2),
			// asynq.ProcessIn(5 * time.Second),
			asynq.Queue(services.QueueCritical),
		}

		return afterCreate(ctx, p, opts...)
	})

	return err
}

func (s *SMSRepository) ListSMS(
	ctx context.Context,
	pgData *pkg.PaginationMetadata,
) ([]*repository.SMS, pkg.PaginationMetadata, error) {
	rslt, err := s.queries.ListSMS(ctx, generated.ListSMSParams{
		Limit:  int32(pgData.PageSize),
		Offset: pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing sms: %s",
			err.Error(),
		)
	}

	sms := make([]*repository.SMS, len(rslt))
	for i, sm := range rslt {
		sms[i] = &repository.SMS{
			ID:         uint32(sm.ID),
			CustomerID: uint32(sm.CustomerID),
			Message:    sm.Message,
			Type:       sm.Type,
			Status:     sm.Status,
			CreatedAt:  sm.CreatedAt,
			CustomerDetails: &repository.Customer{
				ID:          uint32(sm.CustomerID),
				Name:        sm.CustomerName,
				PhoneNumber: sm.CustomerPhoneNumber,
			},
		}
	}

	totalSMS, err := s.queries.CountSMS(ctx)
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count sms: %s",
			err.Error(),
		)
	}

	return sms, pkg.CreatePaginationMetadata(
		uint32(totalSMS),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (s *SMSRepository) ListCustomerSMS(
	ctx context.Context,
	id uint32,
	pgData *pkg.PaginationMetadata,
) ([]*repository.SMS, pkg.PaginationMetadata, error) {
	rslt, err := s.queries.ListCustomerSMS(ctx, generated.ListCustomerSMSParams{
		CustomerID: int64(id),
		Limit:      int32(pgData.PageSize),
		Offset:     pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.PaginationMetadata{}, nil
		}

		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing cutomer sms: %s",
			err.Error(),
		)
	}

	sms := make([]*repository.SMS, len(rslt))
	for i, sm := range rslt {
		sms[i] = &repository.SMS{
			ID:         uint32(sm.ID),
			CustomerID: uint32(sm.CustomerID),
			Message:    sm.Message,
			Type:       sm.Type,
			Status:     sm.Status,
			CreatedAt:  sm.CreatedAt,
			CustomerDetails: &repository.Customer{
				ID:          uint32(sm.CustomerID),
				Name:        sm.CustomerName,
				PhoneNumber: sm.CustomerPhoneNumber,
			},
		}
	}

	totalSMS, err := s.queries.CountCustomerSMS(ctx, int64(id))
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count customer sms: %s",
			err.Error(),
		)
	}

	return sms, pkg.CreatePaginationMetadata(
		uint32(totalSMS),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (s *SMSRepository) UpdateSMS(ctx context.Context, sms *repository.UpdateSMS) error {
	params := generated.UpdateSMSParams{
		RefID: sms.RefID.String(),
	}
	if sms.Cost != nil {
		params.Cost = pgtype.Text{
			Valid:  true,
			String: *sms.Cost,
		}
	}
	if sms.Description != nil {
		params.Description = pgtype.Text{
			Valid:  true,
			String: *sms.Description,
		}
	}
	if sms.CallbackStatus != nil {
		params.CallbackStatus = pgtype.Text{
			Valid:  true,
			String: *sms.CallbackStatus,
		}
	}
	if sms.DeliveryStatus != nil {
		params.Status = pgtype.Text{
			Valid:  true,
			String: *sms.DeliveryStatus,
		}
	}

	if err := s.queries.UpdateSMS(ctx, params); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "error updating sms: %s", err.Error())
	}

	return nil
}

func (s *SMSRepository) GetSMS(ctx context.Context, id uint32) (*repository.SMS, error) {
	sms, err := s.queries.GetSMS(ctx, int64(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "sms not found")
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting sms: %s", err.Error())
	}

	return &repository.SMS{
		ID:         uint32(sms.ID),
		CustomerID: uint32(sms.CustomerID),
		Message:    sms.Message,
		Type:       sms.Type,
		Status:     sms.Status,
		CreatedAt:  sms.CreatedAt,
		CustomerDetails: &repository.Customer{
			ID:          uint32(sms.CustomerID),
			Name:        sms.CustomerName,
			PhoneNumber: sms.CustomerPhoneNumber,
		},
	}, nil
}

func (s *SMSRepository) DeliverSMS(ctx context.Context, id uint32) error {
	ok, err := s.queries.CheckSMSDelivered(ctx, int64(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "sms not found")
		}
		return pkg.Errorf(pkg.INTERNAL_ERROR, "error checking sms: %s", err.Error())
	}
	if ok {
		return pkg.Errorf(pkg.INVALID_ERROR, "sms already delivered")
	}

	err = s.db.ExecTx(ctx, func(q *generated.Queries) error {
		// should be updated after sending sms in the workers

		// if err := q.DeliverSMS(ctx, generated.DeliverSMSParams{
		// 	Status: "delivered",
		// 	ID:     int64(id),
		// }); err != nil {
		// 	if err == sql.ErrNoRows {
		// 		return pkg.Errorf(pkg.NOT_FOUND_ERROR, "sms not found: %s", err.Error())
		// 	}

		// 	return pkg.Errorf(pkg.INTERNAL_ERROR, "error deleting sms: %s", err.Error())
		// }

		// send sms using workers(async)
		log.Println("delivering sms")
		return nil
	})

	return err
}
