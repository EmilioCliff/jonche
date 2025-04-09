package postgres

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.CustomerRepository = (*CustomerRepository)(nil)

type CustomerRepository struct {
	db      *Store
	queries generated.Querier
}

func NewCustomerRepo(db *Store) *CustomerRepository {
	return &CustomerRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (c *CustomerRepository) CreateCustomer(
	ctx context.Context,
	customer *repository.Customer,
) (*repository.Customer, error) {
	rslt, err := c.queries.CreateCustomer(ctx, generated.CreateCustomerParams{
		Name:        strings.ToUpper(customer.Name),
		PhoneNumber: customer.PhoneNumber,
	})
	if err != nil {
		if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
			return nil, pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "%s", err.Error())
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error creating customer: %s", err.Error())
	}

	customer.ID = uint32(rslt.ID)
	customer.Status = rslt.Status
	customer.Loaned = numericToFloat64(rslt.Loaned)
	customer.CreatedAt = rslt.CreatedAt

	return customer, nil
}

func (c *CustomerRepository) ListCustomers(
	ctx context.Context,
	pgData *pkg.PaginationMetadata,
) ([]*repository.Customer, pkg.PaginationMetadata, error) {
	rslt, err := c.queries.ListCustomers(ctx, generated.ListCustomersParams{
		Offset: pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
		Limit:  int32(pgData.PageSize),
	})
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing customers: %s",
			err.Error(),
		)
	}

	customers := make([]*repository.Customer, len(rslt))

	for i, customer := range rslt {
		customers[i] = &repository.Customer{
			ID:          uint32(customer.ID),
			Name:        customer.Name,
			PhoneNumber: customer.PhoneNumber,
			Status:      customer.Status,
			Loaned:      numericToFloat64(customer.Loaned),
			CreatedAt:   customer.CreatedAt,
		}
	}

	totalCustomers, err := c.queries.CountCustomers(ctx)
	if err != nil {
		return nil, pkg.PaginationMetadata{}, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"failed to count customers: %s",
			err.Error(),
		)
	}

	return customers, pkg.CreatePaginationMetadata(
		uint32(totalCustomers),
		pgData.PageSize,
		pgData.CurrentPage,
	), nil
}

func (c *CustomerRepository) GetCustomerList(ctx context.Context) ([]*repository.Customer, error) {
	rslt, err := c.queries.GetCustomerList(ctx)
	if err != nil {
		return nil, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error listing customers: %s",
			err.Error(),
		)
	}

	customers := make([]*repository.Customer, len(rslt))

	for i, customer := range rslt {
		customers[i] = &repository.Customer{
			ID:          uint32(customer.ID),
			Name:        customer.Name,
			PhoneNumber: customer.PhoneNumber,
		}
	}

	return customers, nil
}

func (c *CustomerRepository) GetCustomer(
	ctx context.Context,
	id uint32,
	phoneNumber string,
) (*repository.Customer, error) {
	var params generated.GetCustomerParams
	if id != 0 {
		params.ID = pgtype.Int8{
			Valid: true,
			Int64: int64(id),
		}
	}
	if phoneNumber != "" {
		params.PhoneNumber = pgtype.Text{
			Valid:  true,
			String: phoneNumber,
		}
	}

	customer, err := c.queries.GetCustomer(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting customer: %s", err.Error())
	}

	return &repository.Customer{
		ID:          uint32(customer.ID),
		Name:        customer.Name,
		PhoneNumber: customer.PhoneNumber,
		Status:      customer.Status,
		Loaned:      numericToFloat64(customer.Loaned),
		CreatedAt:   customer.CreatedAt,
	}, nil
}

func (c *CustomerRepository) GetCustomerFullData(
	ctx context.Context,
	id uint32,
	pgData *pkg.PaginationMetadata,
) (*repository.CustomerFullData, error) {
	rslt, err := c.queries.GetCustomerFullData(ctx, generated.GetCustomerFullDataParams{
		ID:     int64(id),
		Limit:  int32(pgData.PageSize),
		Offset: pkg.CalculateOffset(pgData.CurrentPage, pgData.PageSize),
	})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
		}

		return nil, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error getting customer full data: %s",
			err.Error(),
		)
	}

	var customerData repository.Customer
	if len(rslt.Customer) > 0 {
		if err := json.Unmarshal(rslt.Customer, &customerData); err != nil {
			return nil, pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error unmarshalling customerData : %s",
				err.Error(),
			)
		}
	} else {
		return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
	}

	var loanData []repository.Loan
	if len(rslt.Loans) > 0 {
		if err := json.Unmarshal(rslt.Loans, &loanData); err != nil {
			return nil, pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error unmarshalling loanData : %s",
				err.Error(),
			)
		}
	}

	var smsData []repository.SMS
	if len(rslt.Sms) > 0 {
		if err := json.Unmarshal(rslt.Sms, &smsData); err != nil {
			return nil, pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error unmarshalling smsData : %s",
				err.Error(),
			)
		}
	}

	var paymentData []repository.Payment
	if len(rslt.Payments) > 0 {
		if err := json.Unmarshal(rslt.Payments, &paymentData); err != nil {
			return nil, pkg.Errorf(
				pkg.INTERNAL_ERROR,
				"error unmarshalling paymentData: %s",
				err.Error(),
			)
		}
	}

	customerFullData := &repository.CustomerFullData{
		Customer: customerData,
		LoanData: struct {
			Loans    []repository.Loan      `json:"loans"`
			Metadata pkg.PaginationMetadata `json:"meta_data"`
		}{
			Loans: loanData,
			Metadata: pkg.CreatePaginationMetadata(
				uint32(rslt.TotalLoans),
				pgData.PageSize,
				pgData.CurrentPage,
			),
		},
		SMSData: struct {
			SMS      []repository.SMS       `json:"sms"`
			Metadata pkg.PaginationMetadata `json:"meta_data"`
		}{
			SMS: smsData,
			Metadata: pkg.CreatePaginationMetadata(
				uint32(rslt.TotalSms),
				pgData.PageSize,
				pgData.CurrentPage,
			),
		},
		PaymentData: struct {
			Payments []repository.Payment   `json:"payments"`
			Metadata pkg.PaginationMetadata `json:"meta_data"`
		}{
			Payments: paymentData,
			Metadata: pkg.CreatePaginationMetadata(
				uint32(rslt.TotalPayments),
				pgData.PageSize,
				pgData.CurrentPage,
			),
		},
	}

	return customerFullData, nil
}

func (c *CustomerRepository) GetCustomerIDByName(ctx context.Context, name string) (uint32, error) {
	id, err := c.queries.GetCustomerIDByName(ctx, name)
	if err != nil {
		if err == pgx.ErrNoRows {
			return 0, pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
		}

		return 0, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting customer: %s", err.Error())
	}

	return uint32(id), nil
}

func (c *CustomerRepository) UpdateCustomerDetails(
	ctx context.Context,
	customer *repository.UpdateCustomer,
) (*repository.Customer, error) {
	params := generated.UpdateCustomerParams{
		ID: int64(customer.ID),
	}
	if customer.Name != nil {
		params.Name = pgtype.Text{
			Valid:  true,
			String: *customer.Name,
		}
	}
	if customer.PhoneNumber != nil {
		params.PhoneNumber = pgtype.Text{
			Valid:  true,
			String: *customer.PhoneNumber,
		}
	}
	if customer.Status != nil {
		params.Status = pgtype.Bool{
			Valid: true,
			Bool:  *customer.Status,
		}
	}

	rslt, err := c.queries.UpdateCustomer(ctx, params)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error updating customer: %s", err.Error())
	}

	return &repository.Customer{
		ID:          uint32(rslt.ID),
		Name:        rslt.Name,
		PhoneNumber: rslt.PhoneNumber,
		Status:      rslt.Status,
		Loaned:      numericToFloat64(rslt.Loaned),
		CreatedAt:   rslt.CreatedAt,
	}, nil
}

func (c *CustomerRepository) DeleteCustomer(ctx context.Context, id uint32) error {
	if err := c.queries.DeleteCustomer(ctx, int64(id)); err != nil {
		if err == pgx.ErrNoRows {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "customer not found")
		}

		return pkg.Errorf(pkg.INTERNAL_ERROR, "error deleting user: %s", err.Error())
	}

	return nil
}
