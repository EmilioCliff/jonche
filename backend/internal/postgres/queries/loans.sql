-- name: CreateLoan :one
INSERT INTO loans (
    customer_id, description, amount
) VALUES (
    $1, $2, $3
)
RETURNING *;

-- name: ListLoans :many
SELECT 
  loans.*, 
  customers.name AS customer_name, 
  customers.phone_number AS customer_phone_number
FROM loans
JOIN customers ON customers.id = loans.customer_id
ORDER BY loans.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountLoans :one
SELECT COUNT(*) AS total_loans FROM loans;

-- name: ListCustomerLoans :many
SELECT 
  loans.*, 
  customers.name AS customer_name, 
  customers.phone_number AS customer_phone_number
FROM loans
JOIN customers ON customers.id = loans.customer_id
WHERE loans.customer_id = sqlc.arg('customer_id')
ORDER BY loans.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountCustomerLoans :one
SELECT COUNT(*) AS total_loans FROM loans WHERE customer_id = $1;

-- name: GetLoan :one
SELECT
    loans.*,
    customers.name AS customer_name, 
    customers.phone_number AS customer_phone_number
FROM loans
JOIN customers ON customers.id = loans.customer_id
WHERE loans.id = $1
ORDER BY loans.created_at DESC;

-- name: DeleteLoan :exec
DELETE FROM loans WHERE id = $1;
