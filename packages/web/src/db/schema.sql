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

CREATE TABLE tests (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	domain_id BIGINT NOT NULL REFERENCES domains(id),
	
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE test_results (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	test_id BIGINT NOT NULL REFERENCES tests(id),
	test_name TEXT NOT NULL,
	test_result JSONB NOT NULL DEFAULT '{}'::jsonb,

	UNIQUE(test_id, test_name)
);

CREATE TRIGGER
	set_updated_at
	BEFORE UPDATE ON tests 
	FOR EACH ROW EXECUTE PROCEDURE set_update_timestamp();
