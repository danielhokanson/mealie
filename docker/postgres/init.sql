-- =================================================================
-- PostgreSQL Initialization Script for Mealie
-- =================================================================

-- Create extensions for Mealie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create initial schema comment
COMMENT ON SCHEMA public IS 'Mealie Application Schema - Angular Frontend with .NET Backend';
