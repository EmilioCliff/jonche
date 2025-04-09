package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche/pkg"
)

type Customer struct {
	ID          uint32    `json:"id"`
	Name        string    `json:"name"`
	PhoneNumber string    `json:"phone_number"`
	Loaned      float64   `json:"loaned"`
	Status      bool      `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type UpdateCustomer struct {
	ID          uint32  `json:"id"`
	Name        *string `json:"name"`
	PhoneNumber *string `json:"phone_number"`
	Status      *bool   `json:"status"`
}

type CustomerFullData struct {
	Customer Customer `json:"customer"`
	LoanData struct {
		Loans    []Loan                 `json:"loans"`
		Metadata pkg.PaginationMetadata `json:"meta_data"`
	} `json:"loan_data"`
	SMSData struct {
		SMS      []SMS                  `json:"sms"`
		Metadata pkg.PaginationMetadata `json:"meta_data"`
	} `json:"sms_data"`
	PaymentData struct {
		Payments []Payment              `json:"payments"`
		Metadata pkg.PaginationMetadata `json:"meta_data"`
	} `json:"payment"`
}

type SearchCustomer struct {
	SearchValue *string `json:"search_value"`
	Status      *bool   `json:"status"`
}

type CustomerRepository interface {
	CreateCustomer(ctx context.Context, customer *Customer) (*Customer, error)
	ListCustomers(
		ctx context.Context,
		pgData *pkg.PaginationMetadata,
	) ([]*Customer, pkg.PaginationMetadata, error)
	GetCustomer(ctx context.Context, id uint32, phoneNumber string) (*Customer, error)
	GetCustomerFullData(
		ctx context.Context,
		id uint32,
		pgData *pkg.PaginationMetadata,
	) (*CustomerFullData, error)
	UpdateCustomerDetails(ctx context.Context, customer *UpdateCustomer) (*Customer, error)
	DeleteCustomer(ctx context.Context, id uint32) error

	GetCustomerList(ctx context.Context) ([]*Customer, error)
	GetCustomerIDByName(ctx context.Context, name string) (uint32, error)
}
