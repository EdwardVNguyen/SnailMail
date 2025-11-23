-- Migration: Add soft delete fields to customer table
-- Date: 2025-11-21
-- Description: Adds is_deleted and deleted_at columns to support soft delete functionality
-- This preserves historical data and prevents cascade deletion of packages/transactions

USE dbver17;

-- Add is_deleted column (boolean flag)
ALTER TABLE customer
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE NOT NULL
AFTER profile_picture_url;

-- Add deleted_at column (timestamp for when record was deleted)
ALTER TABLE customer
ADD COLUMN deleted_at DATETIME DEFAULT NULL
AFTER is_deleted;

-- Create index on is_deleted for query performance
CREATE INDEX idx_customer_is_deleted ON customer(is_deleted);

-- Optional: Update existing queries to filter out deleted customers
-- Note: Application queries should be updated to include: WHERE is_deleted = FALSE
