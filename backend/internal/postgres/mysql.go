package postgres

import (
	"context"
	"log"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepo struct {
	CustomerRepo repository.CustomerRepository
	UserRepo     repository.UserRepository
	LoanRepo     repository.LoanRepository
	SMSRepo      repository.SMSRepository
	PaymentRepo  repository.PaymentRepository
}

func NewPostgresRepo(store *Store) *PostgresRepo {
	return &PostgresRepo{
		CustomerRepo: NewCustomerRepo(store),
		UserRepo:     NewUserRepository(store),
		LoanRepo:     NewLoanRepository(store),
		SMSRepo:      NewSMSRepository(store),
		PaymentRepo:  NewPaymentRepository(store),
	}
}

type Store struct {
	pool   *pgxpool.Pool
	config pkg.Config
}

func NewStore(config pkg.Config) *Store {
	return &Store{
		config: config,
	}
}

func (s *Store) OpenDB(ctx context.Context) error {
	if s.config.DATABASE_URL == "" {
		return pkg.Errorf(pkg.INVALID_ERROR, "database url cannot be empty")
	}

	pool, err := pgxpool.New(ctx, s.config.DATABASE_URL)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "unable to connect to database: %s", err.Error())
	}

	if err := pool.Ping(ctx); err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "ping db failed: %s", err.Error())
	}

	s.pool = pool

	return s.runMigration()
}

func (s *Store) CloseDB() {
	s.pool.Close()
	log.Println("Shutting down database...")
}

func (s *Store) runMigration() error {
	if s.config.MIGRATION_PATH == "" {
		return pkg.Errorf(pkg.INVALID_ERROR, "migration path cannot be empty")
	}

	m, err := migrate.New(s.config.MIGRATION_PATH, s.config.DATABASE_URL)
	if err != nil {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "failed to load migrations: %s", err.Error())
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return pkg.Errorf(pkg.INTERNAL_ERROR, "error running migrations: %s", err.Error())
	}

	return nil
}

func (s *Store) ExecTx(ctx context.Context, fn func(q *generated.Queries) error) error {
	tx, err := s.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}

	q := generated.New(tx)
	if err := fn(q); err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return pkg.Errorf(pkg.INTERNAL_ERROR, "tx err: %v, rb err: %v", err, rbErr)
		}

		return pkg.Errorf(pkg.INTERNAL_ERROR, "tx err: %v", err)
	}

	return tx.Commit(ctx)
}

func numericToFloat64(n pgtype.Numeric) float64 {
	f, err := n.Float64Value()
	if err != nil {
		log.Println("not float")
		return 0
	}

	return f.Float64
}
