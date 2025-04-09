-- name: CreatePayment :one
INSERT INTO payments (
    transaction_number, transaction_source, paying_name, amount, assigned, assigned_to, paid_at
) VALUES (
    sqlc.arg('transaction_number'), sqlc.arg('transaction_source'), sqlc.arg('paying_name'), sqlc.arg('amount'), sqlc.arg('assigned'), COALESCE(sqlc.narg('assigned_to'), 0), sqlc.arg('paid_at')
)
RETURNING *;

-- name: ListPayments :many
SELECT 
    payments.*, 
    CASE 
        WHEN payments.assigned = TRUE THEN customers.name 
        ELSE NULL 
    END AS customer_name,
    CASE 
        WHEN payments.assigned = TRUE THEN customers.phone_number 
        ELSE NULL 
    END AS customer_phone_number
FROM payments
LEFT JOIN customers ON customers.id = payments.assigned_to
WHERE payments.paid_at BETWEEN sqlc.arg('start_date') AND sqlc.arg('end_date')
ORDER BY payments.paid_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountPayments :one
SELECT COUNT(*) AS total_payments FROM payments
WHERE paid_at BETWEEN sqlc.arg('start_date') AND sqlc.arg('end_date');


-- name: ListCustomerPayments :many
SELECT 
    payments.*, 
    customers.name AS customer_name,
    customers.phone_number AS customer_phone_number
FROM payments
LEFT JOIN customers ON customers.id = payments.assigned_to
WHERE payments.assigned_to = sqlc.arg('customer_id')
ORDER BY payments.paid_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountCustomerPayments :one
SELECT COUNT(*) AS total_payments FROM payments WHERE assigned_to = $1;

-- name: CheckPaymentAssigned :one
SELECT 
  CASE 
    WHEN assigned = TRUE THEN TRUE 
    ELSE FALSE 
  END AS is_assigned
FROM payments
WHERE id = $1;

-- name: GetPayment :one
SELECT 
    payments.*, 
    CASE 
        WHEN payments.assigned = TRUE THEN customers.name 
        ELSE NULL 
    END AS customer_name,
    CASE 
        WHEN payments.assigned = TRUE THEN customers.phone_number 
        ELSE NULL 
    END AS customer_phone_number
FROM payments
LEFT JOIN customers ON customers.id = payments.assigned_to
WHERE payments.id = $1
ORDER BY payments.paid_at DESC;

-- name: AssignPayment :one
UPDATE payments
SET assigned = true,
    assigned_to = $1
WHERE id = $2
RETURNING *;