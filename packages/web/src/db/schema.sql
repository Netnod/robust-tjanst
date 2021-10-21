CREATE OR REPLACE FUNCTION set_update_timestamp()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
$$ language 'plpgsql';

CREATE TABLE domains (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	domain_name VARCHAR NOT NULL,
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE,
	
	UNIQUE(domain_name)
);

CREATE TRIGGER
	set_updated_at
	BEFORE UPDATE ON domains
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();

CREATE TABLE domain_validation_tokens (
	token VARCHAR NOT NULL PRIMARY KEY,
	domain_id BIGINT NOT NULL REFERENCES domains(id),
	-- TODO: ENUM
	check_status VARCHAR NOT NULL,
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER 
	set_updated_at
	BEFORE UPDATE ON domain_validation_tokens
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();

CREATE TABLE accounts (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	email VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	password VARCHAR NOT NULL,
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE,
	
	UNIQUE(email)
);

CREATE TRIGGER
	set_updated_at
	BEFORE UPDATE ON accounts
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();


CREATE TABLE account_domains (
	domain_id BIGINT NOT NULL REFERENCES domains(id),
	account_id BIGINT NOT NULL REFERENCES accounts(id),
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


------------------------------------
-- tests
------------------------------------
CREATE TYPE test_job_status AS ENUM (
	'scheduled',
	'finished',
	'skipped'
);

CREATE TABLE tests (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	domain_id BIGINT NOT NULL REFERENCES domains(id),
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE test_groups (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	test_id BIGINT NOT NULL REFERENCES tests(id),
	group_key TEXT NOT NULL,

	run_status test_job_status NOT NULL,
	result_pass BOOLEAN NOT NULL DEFAULT FALSE,
	result_title TEXT NOT NULL,
	result_description TEXT NOT NULL,

	UNIQUE(test_id, group_key)
);

CREATE TABLE test_group_parts (
	group_id BIGINT NOT NULL REFERENCES test_groups(id),
	part_key TEXT NOT NULL,

	run_status test_job_status NOT NULL,
	run_passed BOOLEAN NOT NULL DEFAULT FALSE,
	run_title TEXT NOT NULL DEFAULT '',
	run_description TEXT NOT NULL DEFAULT '',
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE,

	UNIQUE(group_id, part_key)
);


CREATE TRIGGER
	set_updated_at
	BEFORE UPDATE ON tests 
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();

CREATE TRIGGER
	set_updated_at
	BEFORE UPDATE ON test_group_parts
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();