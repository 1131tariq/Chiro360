import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const createTables = `
BEGIN;

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id serial PRIMARY KEY,
    email character varying(100) UNIQUE NOT NULL,
    password character varying(255) NOT NULL,
    username character varying(50),
    firstname character varying(100),
    lastname character varying(100),
    contactinfo jsonb,
    branch_id integer,
    user_kind character varying(255),
    permission_level character varying(255),
    title character varying(255),
    permissions text[]
);

-- Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    branch_id serial PRIMARY KEY,
    branch_name character varying(100) NOT NULL,
    address jsonb,
    phone character varying(20),
    email character varying(100),
    description text
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    appointment_id serial PRIMARY KEY,
    patient_id integer,
    provider_id integer,
    appointment_date date NOT NULL,
    appointment_time time WITHOUT TIME ZONE NOT NULL,
    appointment_type character varying(50),
    status character varying(20) DEFAULT 'Scheduled',
    created_at timestamp WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    branch_id integer,
    appointment_end_time time WITHOUT TIME ZONE,
    amount numeric(10, 2),
    invoice_status character varying(10),
    case_type character varying(10)
);

-- Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    patientid serial PRIMARY KEY,
    firstname character varying(50),
    lastname character varying(50),
    dateofbirth date,
    gender character varying(10),
    contactinfo jsonb,
    assigned_doctor integer,
    branch_id integer
);

-- SOAPS Table
CREATE TABLE IF NOT EXISTS public.soaps (
    id serial PRIMARY KEY,
    patient_id integer NOT NULL,
    appointment_id integer NOT NULL,
    provider_id integer NOT NULL,
    subjective text,
    objective text,
    assessment text,
    plan text,
    created_by integer,
    updated_by integer,
    status character varying(50)
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id serial PRIMARY KEY,
    branch_id integer NOT NULL,
    item_name character varying(255) NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    unit_price numeric(10, 2) NOT NULL,
    last_updated timestamp WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);

-- CPT Codes Table (if required)
CREATE TABLE IF NOT EXISTS public.cpt_codes (
    id serial PRIMARY KEY,
    code character varying(10) NOT NULL,
    description text
);

-- Foreign Key Constraints
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id)
    REFERENCES public.branches (branch_id) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.appointments
    ADD CONSTRAINT appointments_branch_id_fkey FOREIGN KEY (branch_id)
    REFERENCES public.branches (branch_id) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES public.patients (patientid) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.appointments
    ADD CONSTRAINT appointments_provider_id_fkey FOREIGN KEY (provider_id)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.patients
    ADD CONSTRAINT fk_assigned_doctor FOREIGN KEY (assigned_doctor)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.patients
    ADD CONSTRAINT fk_branch_id FOREIGN KEY (branch_id)
    REFERENCES public.branches (branch_id) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.soaps
    ADD CONSTRAINT soaps_appointment_id_fkey FOREIGN KEY (appointment_id)
    REFERENCES public.appointments (appointment_id) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.soaps
    ADD CONSTRAINT soaps_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.soaps
    ADD CONSTRAINT soaps_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES public.patients (patientid) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.soaps
    ADD CONSTRAINT soaps_provider_id_fkey FOREIGN KEY (provider_id)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.soaps
    ADD CONSTRAINT soaps_updated_by_fkey FOREIGN KEY (updated_by)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT inventory_branch_id_fkey FOREIGN KEY (branch_id)
    REFERENCES public.branches (branch_id) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.inventory
    ADD CONSTRAINT inventory_updated_by_fkey FOREIGN KEY (updated_by)
    REFERENCES public.users (id) ON UPDATE NO ACTION ON DELETE SET NULL;

COMMIT;
`;

const insertDummyData = `
-- Insert Dummy Data into Users Table
INSERT INTO public.users (username, firstname, lastname, email, password, contactinfo, user_kind, permission_level, branch_id, title, permissions)
VALUES
('dummyuser1', 'John', 'Doe', 'john.doe@example.com', '$2b$10$dummyHashedPassword', '{"phone": "123-456-7890", "address": "123 Main St"}', 'admin', 'Admin', 1, 'Manager', ARRAY['read', 'write']),
('dummyuser2', 'Jane', 'Doe', 'jane.doe@example.com', '$2b$10$dummyHashedPassword', '{"phone": "098-765-4321", "address": "456 Maple St"}', 'client', 'Client', 2, 'Client', ARRAY['read']);

-- Insert Dummy Data into Branches Table
INSERT INTO public.branches (branch_name, address, phone, email, description)
VALUES
('Main Branch', '{"street": "123 Main St", "city": "Somewhere", "state": "CA", "zip": "12345"}', '555-1234', 'info@mainbranch.com', 'Primary location'),
('Secondary Branch', '{"street": "456 Maple St", "city": "Anywhere", "state": "CA", "zip": "67890"}', '555-5678', 'info@secondarybranch.com', 'Secondary location');

-- Insert Dummy Data into Patients Table
INSERT INTO public.patients (firstname, lastname, dateofbirth, gender, contactinfo, assigned_doctor, branch_id)
VALUES
('Alice', 'Smith', '1980-01-01', 'Female', '{"phone": "555-1111", "address": "789 Oak St"}', 1, 1),
('Bob', 'Johnson', '1990-02-02', 'Male', '{"phone": "555-2222", "address": "101 Pine St"}', 2, 2);

-- Insert Dummy Data into Appointments Table
INSERT INTO public.appointments (patient_id, provider_id, appointment_date, appointment_time, appointment_type, branch_id)
VALUES
(1, 1, '2024-08-15', '09:00:00', 'Consultation', 1),
(2, 2, '2024-08-16', '10:00:00', 'Follow-up', 2);

-- Insert Dummy Data into SOAPS Table
INSERT INTO public.soaps (patient_id, appointment_id, provider_id, subjective, objective, assessment, plan, created_by, updated_by, status)
VALUES
(1, 1, 1, 'Patient reports a headache.', 'No abnormal findings.', 'Tension headache.', 'Advised rest and hydration.', 1, 1, 'Completed'),
(2, 2, 2, 'Patient reports back pain.', 'Minor discomfort observed.', 'Possible strain.', 'Recommended physical therapy.', 2, 2, 'Pending');

-- Insert Dummy Data into Inventory Table
INSERT INTO public.inventory (branch_id, item_name, quantity, unit_price, updated_by)
VALUES
(1, 'Office Supplies', 100, 12.50, 1),
(2, 'Medical Equipment', 20, 150.00, 2);

-- Insert Dummy Data into CPT Codes Table (if required)
INSERT INTO public.cpt_codes (code, description)
VALUES
('99213', 'Established patient office or other outpatient visit, typically 15 minutes'),
('99214', 'Established patient office or other outpatient visit, typically 25 minutes');

`;

const setupDatabase = async () => {
  try {
    await db.connect();
    console.log("Connected to the database!");

    // Create tables
    await db.query(createTables);
    console.log("Tables created successfully.");

    // Insert dummy data
    await db.query(insertDummyData);
    console.log("Dummy data inserted successfully.");

    await db.end();
    console.log("Database setup complete.");
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();
