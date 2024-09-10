import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

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
    description text,
    price numeric
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

const csvFolder = "./dummyData";

const readCSV = (fileName) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(csvFolder, fileName))
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const insertDataFromCSV = async () => {
  try {
    const users = await readCSV("users.csv");
    const branches = await readCSV("branches.csv");
    const appointments = await readCSV("appointments.csv");
    const patients = await readCSV("patients.csv");
    const soaps = await readCSV("soaps.csv");
    const inventory = await readCSV("inventory.csv");
    const cptCodes = await readCSV("cpt_codes.csv");

    // Insert data into Branches table
    for (const branch of branches) {
      await db.query(
        `INSERT INTO branches (branch_id, branch_name, address, phone, email, description) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          parseInt(branch.branch_id), // Ensure branch_id is an integer
          branch.branch_name, // Branch name as a string
          JSON.parse(branch.address.replace(/'/g, '"')), // Convert address JSON string to object
          branch.phone, // Phone as a string
          branch.email, // Email as a string
          branch.description, // Description as a string
        ]
      );
    }

    // Insert data into Users table
    for (const user of users) {
      console.log(user);
      await db.query(
        `INSERT INTO users (id, email, password, username, firstname, lastname, branch_id, user_kind, permission_level, title, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          parseInt(user.id), // Ensure id is an integer
          user.email, // Email as a string
          user.password, // Password as a string
          user.username, // Username as a string
          user.firstname, // Firstname as a string
          user.lastname, // Lastname as a string
          parseInt(user.branch_id), // Ensure branch_id is an integer
          user.user_kind, // User kind as a string
          user.permission_level, // Permission level as a string
          user.title, // Title as a string
          user.permissions.replace(/{|}/g, "").split(","), // Parse permissions array
        ]
      );
    }

    //Insert data into Patients table
    for (const patient of patients) {
      await db.query(
        `INSERT INTO patients (
                  patientid, firstname, lastname, dateofbirth, gender, contactinfo, assigned_doctor, branch_id
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8
                )`,
        [
          parseInt(patient.patientid), // Ensure it's an integer
          patient.firstname, // String, e.g., 'Michael'
          patient.lastname, // String, e.g., 'Brown'
          patient.dateofbirth, // Date string, e.g., '1975-04-03'
          patient.gender, // String, e.g., 'male'
          JSON.parse(patient.contactinfo.replace(/'/g, '"')), // Parse JSON contactinfo correctly
          parseInt(patient.assigned_doctor), // Ensure it's an integer
          parseInt(patient.branch_id), // Ensure it's an integer
        ]
      );
    }

    //Insert data into appointments table
    for (const appointment of appointments) {
      await db.query(
        `INSERT INTO appointments (
              appointment_id, patient_id, provider_id, appointment_date, appointment_time, appointment_type, status, created_at, branch_id, appointment_end_time, amount, invoice_status, case_type
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )`,
        [
          parseInt(appointment.appointment_id), // Ensure it's an integer
          parseInt(appointment.patient_id), // Ensure it's an integer
          parseInt(appointment.provider_id), // Ensure it's an integer
          appointment.appointment_date, // Date string, e.g., '2024-08-05'
          appointment.appointment_time, // Time string, e.g., '10:00:00'
          appointment.appointment_type, // String, e.g., 'Adjustment'
          appointment.status, // String, e.g., 'Completed'
          new Date(appointment.created_at), // Date string, e.g., '2024-08-01 00:00:00'
          parseInt(appointment.branch_id), // Ensure it's an integer
          appointment.appointment_end_time, // Time string, e.g., '11:00:00'
          parseFloat(appointment.amount), // Convert to a float for monetary values
          appointment.invoice_status, // String, e.g., 'Paid'
          appointment.case_type, // String, e.g., 'Cash'
        ]
      );
    }

    //Insert data into cpt_codes table
    for (const code of cptCodes) {
      await db.query(
        `INSERT INTO cpt_codes (id, code, description, price) VALUES ($1, $2, $3, $4)`,
        [
          parseInt(code.id), // Ensure it's an integer
          code.code, // Code as a string
          code.description, // Description as a string
          parseFloat(code.price), // Ensure it's a float for numeric columns
        ]
      );
    }

    //Insert data into Soaps table
    for (const soap of soaps) {
      await db.query(
        `INSERT INTO soaps (
              id, patient_id, appointment_id, provider_id, subjective, objective, assessment, plan, created_by, updated_by, status
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )`,
        [
          parseInt(soap.id), // Ensure it's an integer
          parseInt(soap.patient_id), // Ensure it's an integer
          parseInt(soap.appointment_id), // Ensure it's an integer
          parseInt(soap.provider_id), // Ensure it's an integer
          soap.subjective, // String, e.g., 'John presented to the office...'
          soap.objective, // String, e.g., 'Since the last visit, palpation...'
          soap.assessment, // String, e.g., 'h'
          soap.plan, // String, e.g., 'The following segments were adjusted...'
          soap.created_by ? parseInt(soap.created_by) : null, // Nullable integer
          soap.updated_by ? parseInt(soap.updated_by) : null, // Nullable integer
          soap.status, // String, e.g., 'Complete'
        ]
      );
    }

    //Insert data into inventory table
    // for (const item of inventoryItems) {
    //   await db.query(
    //     `INSERT INTO public.inventory (id, branch_id, item_name, quantity, unit_price, last_updated, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    //     [
    //       parseInt(item.id), // Ensure id is an integer
    //       parseInt(item.branch_id), // Ensure branch_id is an integer
    //       item.item_name, // Item name as a string
    //       parseInt(item.quantity), // Ensure quantity is an integer
    //       parseFloat(item.unit_price), // Ensure unit_price is a float
    //       new Date(item.last_updated), // Convert last_updated to a date object
    //       parseInt(item.updated_by), // Ensure updated_by is an integer
    //     ]
    //   );
    // }

    console.log("Data inserted successfully from CSV files.");
  } catch (error) {
    console.error("Error inserting data from CSV files:", error);
    process.exit(1);
  }
};

const setupDatabase = async () => {
  try {
    await db.connect();
    console.log("Connected to the database!");

    // Create tables
    await db.query(createTables);
    console.log("Tables created successfully.");

    // Insert data from CSV files
    await insertDataFromCSV();

    await db.end();
    console.log("Database setup complete.");
  } catch (error) {
    console.error("Error setting up the database:", error);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();
