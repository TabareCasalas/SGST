-- Script de inicialización de la base de datos SGST
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor PostgreSQL

-- Conectar a la base de datos sgst_db
\c sgst_db;

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configuraciones adicionales de PostgreSQL
-- (Prisma se encargará de crear las tablas reales)

-- Crear usuario adicional si es necesario
-- CREATE USER sgst_app WITH PASSWORD 'sgst_app_password';
-- GRANT ALL PRIVILEGES ON DATABASE sgst_db TO sgst_app;