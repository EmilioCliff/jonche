package postgres

import (
	"context"
	"strings"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.PaymentRepository = (*PaymentRepository)(nil)

type PaymentRepository struct {
	db      *Store
	queries generated.Querier
}

func NewPaymentRepository(db *Store) *PaymentRepository {
	return &PaymentRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

// pass the callback functions
func (p *PaymentRepository) CreatePayment(
	ctx context.Context,
	payment *repository.Payment,
	afterCreate func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
) (*repository.Payment, error) {
	err := p.db.ExecTx(ctx, func(q *generated.Queries) error {
		var amount pgtype.Numeric

		if err := amount.Scan(pkg.Float64ToString(payment.Amount)); err != nil {
			return pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"failed to scan float to numeric: %s",
				err.Error(),
			)
		}

		params := generated.CreatePaymentParams{
			TransactionNumber: payment.TransactionNumber,
			TransactionSource: payment.TransactionSource,
			PayingName:        strings.ToUpper(payment.PayingName),
			Amount:            amount,
			Assigned:          false,
			PaidAt:            payment.PaidAt,
		}
		if payment.Assigned {
			params.Assigned = true
			params.AssignedTo = payment.AssignedTo
		}

		pp, err := q.CreatePayment(ctx, params)
		if err != nil {
			if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
				return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
			}

			return pkg.Errorf(pkg.INTERNAL_ERROR, "error creating payment: %s", err.Error())
		}

		payment.ID = uint32(pp.ID)
		payment.PaidAt = pp.PaidAt

		if pp.Assigned {
			customer, err := q.ReduceCustomerLoaned(ctx, generated.ReduceCustomerLoanedParams{
				ID:     pp.AssignedTo.Int64,
				Loaned: pp.Amount,
			})
			if err != nil {
				return pkg.Errorf(
					pkg.INTERNAL_ERROR,
					"error reducing customer loaned amount: %s",
					err.Error(),
				)
			}

			mesages, err := pkg.GenerateMessages(services.PaymentSMS, []pkg.CustomerTemplateParams{
				{
					Name:     customer.Name,
					Loaned:   numericToFloat64(customer.Loaned),
					Paid:     payment.Amount,
					PaidDate: payment.PaidAt.Format("02 Jan 2006"),
				},
			})
			if err != nil {
				return err
			}

			pb := generated.CreateSMSParams{
				CustomerID: pp.AssignedTo.Int64,
				Message:    mesages[0],
				Type:       "automated",
				RefID:      uuid.NewString(),
			}

			_, err = q.CreateSMS(ctx, pb)
			if err != nil {
				if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
					return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
				}

				return pkg.Errorf(pkg.INTERNAL_ERROR, "error creating sms: %s", err.Error())
			}

			ps := services.SendSMSPayload{
				Messages:     mesages,
				PhoneNumbers: []string{customer.PhoneNumber},
				RefIds:       []string{pb.RefID},
			}

			opts := []asynq.Option{
				asynq.MaxRetry(3),
				// asynq.ProcessIn(5 * time.Second),
				asynq.Queue(services.QueueCritical),
			}

			return afterCreate(ctx, ps, opts...)
		}

		return nil
	})

	return payment, err
}

func (p *PaymentRepository) ListPayments(
	ctx context.Context,
	pgData *pkg.PaginationMetadata,
) ([]*repository.Payment, pkg.PaginationMetadata, error) {
	rslt, err := p.queries.ListPayments(ctx, generated.ListPaymentsParams{
		Offset:    pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
		Limit:     int32(pgData.PageSize),
		StartDate: *pgData.FromDate,
		EndDate:   *pgData.ToDate,
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing payments: %s",
			err.Error(),
		)
	}

	payments := make([]*repository.Payment, len(rslt))
	for i, payment := range rslt {
		pp := &repository.Payment{
			ID:                uint32(payment.ID),
			TransactionNumber: payment.TransactionNumber,
			TransactionSource: payment.TransactionSource,
			PayingName:        payment.PayingName,
			Amount:            numericToFloat64(payment.Amount),
			Assigned:          payment.Assigned,
			PaidAt:            payment.PaidAt,
		}
		if payment.Assigned {
			pp.AssignedTo = uint32(payment.AssignedTo.Int64)
			pp.CustomerDetails.ID = uint32(payment.AssignedTo.Int64)
			pp.CustomerDetails.Name = payment.CustomerName.(string)
			pp.CustomerDetails.PhoneNumber = payment.CustomerPhoneNumber.(string)
		}

		payments[i] = pp
	}

	totalPayments, err := p.queries.CountPayments(ctx, generated.CountPaymentsParams{
		StartDate: *pgData.FromDate,
		EndDate:   *pgData.ToDate,
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count payments: %s",
			err.Error(),
		)
	}

	return payments, pkg.CreatePaginationMetadata(
		uint32(totalPayments),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (p *PaymentRepository) ListCustomerPayments(
	ctx context.Context,
	id uint32,
	pgData *pkg.PaginationMetadata,
) ([]*repository.Payment, pkg.PaginationMetadata, error) {
	rslt, err := p.queries.ListCustomerPayments(ctx, generated.ListCustomerPaymentsParams{
		CustomerID: pgtype.Int8{
			Valid: true,
			Int64: int64(id),
		},
		Offset: pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
		Limit:  int32(pgData.PageSize),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.PaginationMetadata{}, nil
		}

		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing cutomer payments: %s",
			err.Error(),
		)
	}

	payments := make([]*repository.Payment, len(rslt))
	for i, payment := range rslt {
		pp := &repository.Payment{
			ID:                uint32(payment.ID),
			TransactionNumber: payment.TransactionNumber,
			TransactionSource: payment.TransactionSource,
			PayingName:        payment.PayingName,
			Amount:            numericToFloat64(payment.Amount),
			Assigned:          payment.Assigned,
			PaidAt:            payment.PaidAt,
		}
		if payment.Assigned {
			pp.AssignedTo = uint32(payment.AssignedTo.Int64)
			pp.CustomerDetails.ID = uint32(payment.AssignedTo.Int64)
		}

		payments[i] = pp
	}

	totalPayments, err := p.queries.CountCustomerPayments(ctx, pgtype.Int8{
		Valid: true,
		Int64: int64(id),
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count customer payments: %s",
			err.Error(),
		)
	}

	return payments, pkg.CreatePaginationMetadata(
		uint32(totalPayments),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (p *PaymentRepository) GetPayment(
	ctx context.Context,
	id uint32,
) (*repository.Payment, error) {
	payment, err := p.queries.GetPayment(ctx, int64(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "payment not found")
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting loan: %s", err.Error())
	}

	pp := &repository.Payment{
		ID:                uint32(payment.ID),
		TransactionNumber: payment.TransactionNumber,
		TransactionSource: payment.TransactionSource,
		PayingName:        payment.PayingName,
		Amount:            numericToFloat64(payment.Amount),
		Assigned:          payment.Assigned,
		PaidAt:            payment.PaidAt,
	}
	if payment.Assigned {
		pp.AssignedTo = uint32(payment.AssignedTo.Int64)
		pp.CustomerDetails.ID = uint32(payment.AssignedTo.Int64)
		pp.CustomerDetails.Name = payment.CustomerName.(string)
		pp.CustomerDetails.PhoneNumber = payment.CustomerPhoneNumber.(string)
	}

	return pp, nil
}

// pass the callback functions
func (p *PaymentRepository) AssignPayment(
	ctx context.Context,
	paymentId uint32,
	customerId uint32,
	afterAssign func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
) error {
	ok, err := p.queries.CheckPaymentAssigned(ctx, int64(paymentId))
	if err != nil {
		if err == pgx.ErrNoRows {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "payment not found")
		}
		return pkg.Errorf(pkg.INTERNAL_ERROR, "error checking payment: %s", err.Error())
	}
	if ok {
		return pkg.Errorf(pkg.INVALID_ERROR, "payment already assigned")
	}

	err = p.db.ExecTx(ctx, func(q *generated.Queries) error {
		payment, err := q.AssignPayment(ctx, generated.AssignPaymentParams{
			ID: int64(paymentId),
			AssignedTo: pgtype.Int8{
				Valid: true,
				Int64: int64(customerId),
			},
		})
		if err != nil {
			if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
				return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
			}

			return pkg.Errorf(pkg.INTERNAL_ERROR, "error assigning payment: %s", err.Error())
		}

		customer, err := q.ReduceCustomerLoaned(ctx, generated.ReduceCustomerLoanedParams{
			ID:     int64(customerId),
			Loaned: payment.Amount,
		})
		if err != nil {
			return pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error reducing customer loaned amount: %s",
				err.Error(),
			)
		}

		mesages, err := pkg.GenerateMessages(services.PaymentSMS, []pkg.CustomerTemplateParams{
			{
				Name:     customer.Name,
				Loaned:   numericToFloat64(customer.Loaned),
				Paid:     numericToFloat64(payment.Amount),
				PaidDate: payment.PaidAt.Format("02 Jan 2006"),
			},
		})
		if err != nil {
			return err
		}

		id := uuid.NewString()
		_, err = q.CreateSMS(ctx, generated.CreateSMSParams{
			CustomerID: int64(customerId),
			Message:    mesages[0],
			Type:       "automated",
			RefID:      id,
		})
		if err != nil {
			if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
				return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
			}

			return pkg.Errorf(pkg.INTERNAL_ERROR, "error creating sms: %s", err.Error())
		}

		ps := services.SendSMSPayload{
			Messages:     mesages,
			PhoneNumbers: []string{customer.PhoneNumber},
			RefIds:       []string{id},
		}

		opts := []asynq.Option{
			asynq.MaxRetry(3),
			// asynq.ProcessIn(5 * time.Second),
			asynq.Queue(services.QueueCritical),
		}

		return afterAssign(ctx, ps, opts...)
	})

	return err
}
