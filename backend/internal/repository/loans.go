package repository

import (
	"context"
	"time"

	"github.com/EmilioCliff/jonche/pkg"
)

type Loan struct {
	ID              uint32    `json:"id"`
	CustomerID      uint32    `json:"customer_id"`
	Description     string    `json:"description"`
	Amount          float64   `json:"amount"`
	CreatedAt       time.Time `json:"created_at"`
	CustomerDetails *Customer `json:"customer_details,omitempty"`
}

type LoanRepository interface {
	CreateLoan(ctx context.Context, loan *Loan) (*Loan, error)
	ListLoan(
		ctx context.Context,
		pgData *pkg.PaginationMetadata,
	) ([]*Loan, pkg.PaginationMetadata, error)
	ListCustomerLoans(
		ctx context.Context,
		id uint32,
		pgData *pkg.PaginationMetadata,
	) ([]*Loan, pkg.PaginationMetadata, error)
	GetLoan(ctx context.Context, id uint32) (*Loan, error)
	DeleteLoan(ctx context.Context, id uint32) error

	// SearchLoan(ctx context.Context, search *string) ([]*Loan, error)
}
