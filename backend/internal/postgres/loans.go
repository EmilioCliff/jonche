package postgres

import (
	"context"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.LoanRepository = (*LoanRepository)(nil)

type LoanRepository struct {
	db      *Store
	queries generated.Querier
}

func NewLoanRepository(db *Store) *LoanRepository {
	return &LoanRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (l *LoanRepository) CreateLoan(
	ctx context.Context,
	loan *repository.Loan,
) (*repository.Loan, error) {
	var rsp repository.Loan

	err := l.db.ExecTx(ctx, func(q *generated.Queries) error {
		var amount pgtype.Numeric

		if err := amount.Scan(pkg.Float64ToString(loan.Amount)); err != nil {
			return pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"failed to scan float to numeric: %s",
				err.Error(),
			)
		}
		rslt, err := q.CreateLoan(ctx, generated.CreateLoanParams{
			CustomerID:  int64(loan.CustomerID),
			Description: loan.Description,
			Amount:      amount,
		})
		if err != nil {
			if pkg.PgxErrorCode(err) == pkg.FOREIGN_KEY_VIOLATION {
				return pkg.Errorf(pkg.INVALID_ERROR, "foreign key violation: %s", err.Error())
			}

			return pkg.Errorf(pkg.INTERNAL_ERROR, "error creating loan: %s", err.Error())
		}

		rsp.ID = uint32(rslt.ID)
		rsp.CustomerID = uint32(rslt.CustomerID)
		rsp.Description = rslt.Description
		rsp.Amount = numericToFloat64(rslt.Amount)
		rsp.CreatedAt = rslt.CreatedAt

		if err := q.AddCustomerLoaned(ctx, generated.AddCustomerLoanedParams{
			Loaned: amount,
			ID:     int64(loan.CustomerID),
		}); err != nil {
			return pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error adding loan amount to customer: %s",
				err.Error(),
			)
		}

		return nil
	})

	return &rsp, err
}

func (l *LoanRepository) ListLoan(
	ctx context.Context,
	pgData *pkg.PaginationMetadata,
) ([]*repository.Loan, pkg.PaginationMetadata, error) {
	rslt, err := l.queries.ListLoans(ctx, generated.ListLoansParams{
		Offset: pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
		Limit:  int32(pgData.PageSize),
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing loans: %s",
			err.Error(),
		)
	}

	loans := make([]*repository.Loan, len(rslt))
	for i, loan := range rslt {
		loans[i] = &repository.Loan{
			ID:          uint32(loan.ID),
			CustomerID:  uint32(loan.CustomerID),
			Description: loan.Description,
			Amount:      numericToFloat64(loan.Amount),
			CreatedAt:   loan.CreatedAt,
			CustomerDetails: &repository.Customer{
				ID:          uint32(loan.CustomerID),
				Name:        loan.CustomerName,
				PhoneNumber: loan.CustomerPhoneNumber,
			},
		}
	}

	totalLoans, err := l.queries.CountLoans(ctx)
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count loans: %s",
			err.Error(),
		)
	}

	return loans, pkg.CreatePaginationMetadata(
		uint32(totalLoans),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (l *LoanRepository) ListCustomerLoans(
	ctx context.Context,
	id uint32,
	pgData *pkg.PaginationMetadata,
) ([]*repository.Loan, pkg.PaginationMetadata, error) {
	rslt, err := l.queries.ListCustomerLoans(ctx, generated.ListCustomerLoansParams{
		CustomerID: int64(id),
		Offset:     pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
		Limit:      int32(pgData.PageSize),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.PaginationMetadata{}, nil
		}

		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing customer loans: %s",
			err.Error(),
		)
	}

	loans := make([]*repository.Loan, len(rslt))
	for i, loan := range rslt {
		loans[i] = &repository.Loan{
			ID:          uint32(loan.ID),
			CustomerID:  uint32(loan.CustomerID),
			Description: loan.Description,
			Amount:      numericToFloat64(loan.Amount),
			CreatedAt:   loan.CreatedAt,
			CustomerDetails: &repository.Customer{
				ID:          uint32(loan.CustomerID),
				Name:        loan.CustomerName,
				PhoneNumber: loan.CustomerPhoneNumber,
			},
		}
	}

	totalLoans, err := l.queries.CountCustomerLoans(ctx, int64(id))
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count customer loans: %s",
			err.Error(),
		)
	}

	return loans, pkg.CreatePaginationMetadata(
		uint32(totalLoans),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (l *LoanRepository) GetLoan(ctx context.Context, id uint32) (*repository.Loan, error) {
	loan, err := l.queries.GetLoan(ctx, int64(id))
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "loan not found")
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting loan: %s", err.Error())
	}

	return &repository.Loan{
		ID:          uint32(loan.ID),
		CustomerID:  uint32(loan.CustomerID),
		Description: loan.Description,
		Amount:      numericToFloat64(loan.Amount),
		CreatedAt:   loan.CreatedAt,
		CustomerDetails: &repository.Customer{
			ID:          uint32(loan.CustomerID),
			Name:        loan.CustomerName,
			PhoneNumber: loan.CustomerPhoneNumber,
		},
	}, nil

}

func (l *LoanRepository) DeleteLoan(ctx context.Context, id uint32) error {
	if err := l.queries.DeleteLoan(ctx, int64(id)); err != nil {
		if err == pgx.ErrNoRows {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "loan not found")
		}

		return pkg.Errorf(pkg.INTERNAL_ERROR, "error deleting loan: %s", err.Error())
	}

	return nil
}
