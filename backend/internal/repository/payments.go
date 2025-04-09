package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/hibiken/asynq"
)

type Payment struct {
	ID                uint32    `json:"id"`
	TransactionNumber string    `json:"transaction_number"`
	TransactionSource string    `json:"transaction_source"`
	PayingName        string    `json:"paying_name"`
	Amount            float64   `json:"amount"`
	Assigned          bool      `json:"assigned"`
	AssignedTo        uint32    `json:"assigned_to"`
	PaidAt            time.Time `json:"paid_at"`
	CustomerDetails   Customer  `json:"customer_details,omitempty"`
}

type PaymentRepository interface {
	CreatePayment(
		ctx context.Context,
		payment *Payment,
		afterCreate func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
	) (*Payment, error)
	ListPayments(
		ctx context.Context,
		pgData *pkg.PaginationMetadata,
	) ([]*Payment, pkg.PaginationMetadata, error)
	ListCustomerPayments(
		ctx context.Context,
		id uint32,
		pgData *pkg.PaginationMetadata,
	) ([]*Payment, pkg.PaginationMetadata, error)
	GetPayment(ctx context.Context, id uint32) (*Payment, error)
	AssignPayment(
		ctx context.Context,
		paymentId uint32,
		customerId uint32,
		afterAssign func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
	) error

	// SearchPayment(ctx context.Context, search string) ([]*Payment, error)
}
