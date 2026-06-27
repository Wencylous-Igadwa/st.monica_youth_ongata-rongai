-- Add homepage column to events table (MariaDB 10.5+)
ALTER TABLE events ADD COLUMN IF NOT EXISTS homepage TINYINT(1) DEFAULT 0;
