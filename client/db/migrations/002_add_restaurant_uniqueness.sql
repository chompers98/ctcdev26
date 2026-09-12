-- Migration 002: prevent duplicate restaurants (same name + address).
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_name_address
  ON restaurants (LOWER(name), LOWER(address));