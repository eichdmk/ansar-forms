CREATE DATABASE ansar_forms;

\c ansar_forms;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,               
  label TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  "order" INT NOT NULL,
  options JSONB,                    
  created_at TIMESTAMP DEFAULT now()
);


CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);


CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value JSONB NOT NULL
);
