CREATE EXTENSION IF NOT EXISTS citus;

CREATE DATABASE vault5;

\c vault5;

CREATE USER vault5_user WITH PASSWORD 'vault5_pass';

GRANT ALL PRIVILEGES ON DATABASE vault5 TO vault5_user;

-- Schemas for microservices
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS accounts;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS investments;
CREATE SCHEMA IF NOT EXISTS loans;
CREATE SCHEMA IF NOT EXISTS lending;

GRANT ALL ON SCHEMA auth TO vault5_user;
GRANT ALL ON SCHEMA accounts TO vault5_user;
GRANT ALL ON SCHEMA transactions TO vault5_user;
GRANT ALL ON SCHEMA investments TO vault5_user;
GRANT ALL ON SCHEMA loans TO vault5_user;
GRANT ALL ON SCHEMA lending TO vault5_user;