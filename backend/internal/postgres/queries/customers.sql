-- name: CreateCustomer :one
INSERT INTO customers (
  name, phone_number
) VALUES (
  $1, $2
)
RETURNING *;

-- name: ListCustomers :many
SELECT * FROM customers
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetCustomerList :many
SELECT id, name, phone_number FROM customers
ORDER BY created_at DESC;

-- name: CountCustomers :one
SELECT COUNT(*) AS total_customers FROM customers;

-- name: GetCustomerIDByName :one
SELECT id FROM customers 
WHERE name = sqlc.arg('name')
LIMIT 1;

-- name: GetCustomer :one
SELECT * FROM customers
WHERE 
  (id = sqlc.narg('id') OR phone_number = sqlc.narg('phone_number'))
LIMIT 1;

-- name: GetCustomerFullData :one
WITH customer_data AS (
  SELECT customers.* FROM customers
  WHERE customers.id = sqlc.arg('id')
),
loans_paginated AS (
  SELECT * FROM loans 
  WHERE loans.customer_id = sqlc.arg('id')
  ORDER BY created_at DESC
  LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset')
),
sms_paginated AS (
  SELECT * FROM sms 
  WHERE sms.customer_id = sqlc.arg('id')
  ORDER BY created_at DESC
  LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset')
),
payments_paginated AS (
  SELECT * FROM payments 
  WHERE payments.assigned_to = sqlc.arg('id')
  ORDER BY paid_at DESC
  LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset')
),
loans_count AS (
  SELECT COUNT(*) AS total_loans FROM loans WHERE loans.customer_id = sqlc.arg('id')
),
sms_count AS (
  SELECT COUNT(*) AS total_sms FROM sms WHERE sms.customer_id = sqlc.arg('id')
),
payments_count AS (
  SELECT COUNT(*) AS total_payments FROM payments WHERE payments.assigned_to = sqlc.arg('id')
)
SELECT 
  (SELECT row_to_json(c) FROM (SELECT * FROM customer_data) c) AS customer,
  (SELECT json_agg(l) FROM loans_paginated l) AS loans,
  (SELECT json_agg(s) FROM sms_paginated s) AS sms,
  (SELECT json_agg(p) FROM payments_paginated p) AS payments,
  (SELECT total_loans FROM loans_count) AS total_loans,
  (SELECT total_sms FROM sms_count) AS total_sms,
  (SELECT total_payments FROM payments_count) AS total_payments;

-- name: AddCustomerLoaned :exec
UPDATE customers
SET loaned = loaned + $1
WHERE id = $2; 

-- name: ReduceCustomerLoaned :one
UPDATE customers
SET loaned = loaned - $1
WHERE id = $2
RETURNING *; 

-- name: UpdateCustomer :one
UPDATE customers
SET name = coalesce(sqlc.narg('name'), name),
    phone_number = coalesce(sqlc.narg('phone_number'), phone_number),
    status = coalesce(sqlc.narg('status'), status)
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteCustomer :exec
DELETE FROM customers WHERE id = $1;