-- name: GetDashboardStats :one
WITH 
  total_customers AS (
    SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = TRUE) AS active,
           COUNT(*) FILTER (WHERE status = FALSE) AS inactive
    FROM customers
  ),
  total_loans AS (
    SELECT 
      COUNT(*) AS total_loans,
      SUM(amount) AS total_disbursed
    FROM loans
  ),
  total_payments AS (
    SELECT 
      SUM(amount) AS total_payments_received,
      SUM(amount) FILTER (WHERE assigned = TRUE) AS assigned_total,
      SUM(amount) FILTER (WHERE assigned = FALSE) AS unassigned_total
    FROM payments
  ),
  sms_stats AS (
    SELECT 
      COUNT(*) AS total_sms,
      COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
      COUNT(*) FILTER (WHERE status != 'delivered') AS undelivered
    FROM sms
  )
SELECT 
  -- Customers
  tc.total AS total_customers,
  tc.active AS active_customers,
  tc.inactive AS inactive_customers,

  -- Loans
  tl.total_loans,
  tl.total_disbursed,

  -- Payments
  tp.total_payments_received,
  tp.assigned_total,
  tp.unassigned_total,

  -- SMS
  ss.delivered AS sms_delivered,
  ss.undelivered AS sms_undelivered,
  ss.total_sms
FROM total_customers tc, total_loans tl, total_payments tp, sms_stats ss;

-- name: GetDashboardOverview :many
SELECT
    TO_CHAR(date_trunc('month', date_val), 'Mon') AS name,
    SUM(loans_amount) AS loans,
    SUM(payments_amount) AS payments
FROM (
    SELECT
        created_at AS date_val,
        amount AS loans_amount,
        0 AS payments_amount
    FROM loans
    UNION ALL
    SELECT
        paid_at AS date_val,
        0 AS loans_amount,
        amount AS payments_amount
    FROM payments
) AS combined
GROUP BY date_trunc('month', date_val)
ORDER BY date_trunc('month', date_val);

