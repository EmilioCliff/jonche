package postgres

import (
	"context"

	"github.com/EmilioCliff/jonche/internal/postgres/generated"
	"github.com/EmilioCliff/jonche/internal/repository"
	"github.com/EmilioCliff/jonche/pkg"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ repository.UserRepository = (*UserRepository)(nil)

type UserRepository struct {
	db      *Store
	queries generated.Querier
}

func NewUserRepository(db *Store) *UserRepository {
	return &UserRepository{
		db:      db,
		queries: generated.New(db.pool),
	}
}

func (u *UserRepository) CreateUser(
	ctx context.Context,
	user *repository.User,
) (*repository.User, error) {
	rslt, err := u.queries.CreateUser(ctx, generated.CreateUserParams{
		Name:         user.Name,
		Email:        user.Email,
		Password:     user.Password,
		RefreshToken: "refresh_token",
	})
	if err != nil {
		if pkg.PgxErrorCode(err) == pkg.UNIQUE_VIOLATION {
			return nil, pkg.Errorf(pkg.ALREADY_EXISTS_ERROR, "%s", err.Error())
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error creating user: %s", err.Error())
	}

	user.ID = uint32(rslt.ID)

	return user, nil
}

func (u *UserRepository) ListUsers(ctx context.Context) ([]*repository.User, error) {
	rslt, err := u.queries.ListUsers(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error listing users: %s", err.Error())
	}

	users := make([]*repository.User, len(rslt))

	for i, user := range rslt {
		users[i] = &repository.User{
			ID:    uint32(user.ID),
			Name:  user.Name,
			Email: user.Email,
		}
	}

	return users, nil
}

func (u *UserRepository) GetUser(
	ctx context.Context,
	id *uint32,
	email *string,
) (*repository.User, error) {
	var params generated.GetUserParams
	if id != nil {
		params.ID = pgtype.Int8{
			Valid: true,
			Int64: int64(*id),
		}
	} else {
		params.Email = pgtype.Text{
			Valid:  true,
			String: *email,
		}
	}

	user, err := u.queries.GetUser(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, pkg.Errorf(pkg.NOT_FOUND_ERROR, "user not found")
		}

		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting user: %s", err.Error())
	}

	return &repository.User{
		ID:           uint32(user.ID),
		Name:         user.Name,
		Email:        user.Email,
		Password:     user.Password,
		RefreshToken: user.RefreshToken,
	}, nil
}

func (u *UserRepository) UpdateUserDetails(
	ctx context.Context,
	user *repository.UpdateUser,
) (*repository.User, error) {
	params := generated.UpdateUserParams{
		ID: int64(user.ID),
	}
	if user.Name != nil {
		params.Name = pgtype.Text{
			Valid:  true,
			String: *user.Name,
		}
	}

	if user.Password != nil {
		params.Password = pgtype.Text{
			Valid:  true,
			String: *user.Password,
		}
	}

	if user.RefreshToken != nil {
		params.RefreshToken = pgtype.Text{
			Valid:  true,
			String: *user.RefreshToken,
		}
	}

	rslt, err := u.queries.UpdateUser(ctx, params)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error updating user: %s", err.Error())
	}

	return &repository.User{
		ID:           uint32(rslt.ID),
		Name:         rslt.Name,
		Email:        rslt.Email,
		Password:     rslt.Password,
		RefreshToken: rslt.RefreshToken,
	}, nil
}

func (u *UserRepository) DeleteUser(ctx context.Context, id uint32) error {
	if err := u.queries.DeleteUser(ctx, int64(id)); err != nil {
		if err == pgx.ErrNoRows {
			return pkg.Errorf(pkg.NOT_FOUND_ERROR, "user not found")
		}

		return pkg.Errorf(pkg.INTERNAL_ERROR, "error deleting user: %s", err.Error())
	}

	return nil
}

func (u *UserRepository) GetDashboardStats(ctx context.Context) (any, error) {
	rslt, err := u.queries.GetDashboardStats(ctx)
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error getting dashboard stats: %s", err.Error())
	}

	return rslt, nil
}

func (u *UserRepository) GetDashboardOverview(ctx context.Context) (any, error) {
	rslt, err := u.queries.GetDashboardOverview(ctx)
	if err != nil {
		return nil, pkg.Errorf(
			pkg.INTERNAL_ERROR,
			"error getting dashboard overview: %s",
			err.Error(),
		)
	}

	return rslt, nil
}
