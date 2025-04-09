package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche/internal/services"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

type SMS struct {
	ID              uint32    `json:"id"`
	CustomerID      uint32    `json:"customer_id"`
	Message         string    `json:"message"`
	Type            string    `json:"type"                       binding:"oneof=automated manual"`
	Status          string    `json:"status"                     binding:"oneof=delivered undelivered"`
	CreatedAt       time.Time `json:"created_at"`
	CustomerDetails *Customer `json:"customer_details,omitempty"`
}

type UpdateSMS struct {
	RefID          uuid.UUID `json:"ref_id"`
	Cost           *string   `json:"cost"`
	Description    *string   `json:"description"`
	DeliveryStatus *string   `json:"delivery_status"`
	CallbackStatus *string   `json:"callback_status"`
}

type SearchSMS struct {
	SearchValue *string `json:"search_value"`
	Type        *string `json:"type"`
	Status      *string `json:"status"`
}

type SMSRepository interface {
	// create bulk sms
	CreateSMS(
		ctx context.Context,
		sms *SMS,
		ids []uint32,
		afterCreate func(context.Context, services.SendSMSPayload, ...asynq.Option) error,
	) error
	ListSMS(
		ctx context.Context,
		pgData *pkg.PaginationMetadata,
	) ([]*SMS, pkg.PaginationMetadata, error)
	ListCustomerSMS(
		ctx context.Context,
		id uint32,
		pgData *pkg.PaginationMetadata,
	) ([]*SMS, pkg.PaginationMetadata, error)
	GetSMS(ctx context.Context, id uint32) (*SMS, error)
	DeliverSMS(ctx context.Context, id uint32) error
	UpdateSMS(ctx context.Context, sms *UpdateSMS) error

	// SearchSMS(ctx context.Context, searchParams *SearchSMS) ([]*SMS, error)
}
