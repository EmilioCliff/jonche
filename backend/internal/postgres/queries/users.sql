-- name: CreateUser :one
INSERT INTO users (
  name, email, password, refresh_token
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: ListUsers :many
SELECT id, name, email FROM users;

-- name: GetUser :one
SELECT * FROM users
WHERE 
  (id = sqlc.narg('id') OR email = sqlc.narg('email'))
LIMIT 1;

-- name: UpdateUser :one
UPDATE users
SET name = coalesce(sqlc.narg('name'), name),
    password = coalesce(sqlc.narg('password'), password),
    refresh_token = coalesce(sqlc.narg('refresh_token'), refresh_token)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
