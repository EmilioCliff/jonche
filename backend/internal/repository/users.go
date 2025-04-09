package repository

import "context"

type User struct {
	ID           uint32 `json:"id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Password     string `json:"password,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

type UpdateUser struct {
	ID           uint32  `json:"id"`
	Name         *string `json:"name"`
	Password     *string `json:"password"`
	RefreshToken *string `json:"refresh_token"`
}

type UserRepository interface {
	CreateUser(ctx context.Context, user *User) (*User, error)
	ListUsers(ctx context.Context) ([]*User, error)
	GetUser(ctx context.Context, id *uint32, email *string) (*User, error)
	UpdateUserDetails(ctx context.Context, user *UpdateUser) (*User, error)
	DeleteUser(ctx context.Context, id uint32) error

	GetDashboardStats(ctx context.Context) (any, error)
	GetDashboardOverview(ctx context.Context) (any, error)
}
