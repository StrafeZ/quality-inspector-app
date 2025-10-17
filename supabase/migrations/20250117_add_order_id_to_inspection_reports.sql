-- Migration: Add order_id column to inspection_reports table
-- Date: 2025-01-17
-- Description: Changes inspections from job-card-level to order-level

-- Add order_id column to inspection_reports table
ALTER TABLE inspection_reports
ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(order_id);

-- Make job_card_id nullable (inspections are now order-level, not job-card-level)
ALTER TABLE inspection_reports
ALTER COLUMN job_card_id DROP NOT NULL;

-- Make inspector_name nullable (safety measure for edge cases)
ALTER TABLE inspection_reports
ALTER COLUMN inspector_name DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_inspection_reports_order_id
ON inspection_reports(order_id);

-- Add completed_at column for tracking when inspection was finalized
ALTER TABLE inspection_reports
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add comment explaining the change
COMMENT ON COLUMN inspection_reports.order_id IS 'Foreign key to orders table. Inspections are now order-level rather than job-card-level.';
COMMENT ON COLUMN inspection_reports.completed_at IS 'Timestamp when the inspection was completed and finalized.';
