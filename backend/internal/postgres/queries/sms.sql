-- name: CreateSMS :one
INSERT INTO sms (
    customer_id, message, type, ref_id
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: ListCustomerSMS :many
SELECT 
  sms.*, 
  customers.name AS customer_name, 
  customers.phone_number AS customer_phone_number
FROM sms
JOIN customers ON customers.id = sms.customer_id
WHERE sms.customer_id = sqlc.arg('customer_id')
ORDER BY sms.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountCustomerSMS :one
SELECT COUNT(*) AS total_sms FROM sms WHERE customer_id = $1;

-- name: ListSMS :many
SELECT 
  sms.*, 
  customers.name AS customer_name, 
  customers.phone_number AS customer_phone_number
FROM sms
JOIN customers ON customers.id = sms.customer_id
ORDER BY sms.created_at DESC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: CountSMS :one
SELECT COUNT(*) AS total_sms FROM sms;

-- name: CheckSMSDelivered :one
SELECT 
  CASE 
    WHEN status = 'delivered' THEN TRUE 
    ELSE FALSE 
  END AS is_delivered
FROM sms
WHERE id = $1;

-- name: UpdateSMS :exec
UPDATE sms
SET cost = coalesce(sqlc.narg('cost'), cost),
    description = coalesce(sqlc.narg('description'), description),
    callback_status = coalesce(sqlc.narg('callback_status'), callback_status),
    status = coalesce(sqlc.narg('status'), status)
WHERE ref_id = sqlc.arg('ref_id');

-- name: GetSMS :one
SELECT
    sms.*,
    customers.name AS customer_name, 
    customers.phone_number AS customer_phone_number
FROM sms
JOIN customers ON customers.id = sms.customer_id
WHERE sms.id = $1
ORDER BY sms.created_at DESC;

-- name: DeliverSMS :exec
UPDATE sms
SET status = $1
WHERE id = $2;