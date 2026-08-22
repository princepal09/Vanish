-- Create the database if it does not already exist
IF NOT EXISTS (
  SELECT
    name
  FROM
    sys.databases
  WHERE
    name = 'VanishDB'
) BEGIN
CREATE DATABASE VanishDB;

END
GO
-- Switch to the VanishDB database
USE VanishDB;

GO
-- Create Notes table
IF NOT EXISTS (
  SELECT
    *
  FROM
    sys.tables
  WHERE
    name = 'Notes'
) BEGIN
CREATE TABLE Notes (
  -- Internal primary key
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  -- Public random identifier used in the URL
  token NVARCHAR(128) NOT NULL,
  -- Encrypted secret/note
  encryptedPayload VARBINARY(MAX) NOT NULL,
  -- AES encryption initialization vector
  iv VARBINARY(32) NOT NULL,
  -- AES-GCM authentication tag
  authTag VARBINARY(32) NOT NULL,
  -- When the note expires
  expiresAt DATETIME2 NOT NULL,
  -- When the note was created
  createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  -- When the note was successfully read
  readAt DATETIME2 NULL,
  -- Optional hashed passphrase
  passphraseHash NVARCHAR(255) NULL,
  -- Number of incorrect passphrase attempts
  failedAttempts INT NOT NULL DEFAULT 0,
  -- Primary key
  CONSTRAINT PK_Notes PRIMARY KEY (id),
  -- Token must be unique
  CONSTRAINT UQ_Notes_Token UNIQUE (token),
  -- Failed attempts cannot be negative
  CONSTRAINT CHK_Notes_FailedAttempts CHECK (failedAttempts >= 0)
);

END
GO
-- Index for faster expiry cleanup queries
IF NOT EXISTS (
  SELECT
    *
  FROM
    sys.indexes
  WHERE
    name = 'IX_Notes_ExpiresAt'
) BEGIN
CREATE INDEX IX_Notes_ExpiresAt ON Notes (expiresAt);

END
GO