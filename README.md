# Chiro360 Project

This project includes a React frontend and an Express backend that connects to a PostgreSQL database. The setup is fully automated so you can get everything running with a single command.

## Project Structure

Chiro360/ │
├── Client/
│ └── my-react-app/ # React frontend
│
├── Server/ # Express backend
│ ├── index.js # Main server file
│ ├── setupDB.js # Script to set up PostgreSQL and insert dummy data
│ ├── .env # Environment variables for PostgreSQL and server settings
│
└── README.md # Project instructions

## Prerequisites

Before running the project, ensure you have the following installed on your machine:

1. **Node.js and npm**: [Download and install here](https://nodejs.org/).

2. **PostgreSQL**: [Download and install here](https://www.postgresql.org/download/).

### Note on PostgreSQL Setup

- During PostgreSQL installation, take note of the following information as you will need it to configure the `.env` file in step 2:
  - **Username**
  - **Password**
  - **Database Name**

## Getting Started

Follow these steps to set up and run the project:

### 1. Extract, and Navigate into the Code Directory

1. Extract the ZIP file to a location on your computer.
2. Open a terminal window (e.g., Bash).
3. Navigate into the `Chiro360` directory by running:

   ```bash
   cd path/to/Chiro360 #Replace path/to/Chiro360 with the path to where you extracted the ZIP file.
   ```

### 2. Set Up Environment Variables

cd Server
touch .env

# Open the .env file in a text editor (e.g., nano, vim, or code . for Visual Studio Code) and paste the following environment variables. Adjust the values to match your PostgreSQL setup:

PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PASSWORD=your_postgres_password
PG_PORT=5432

SESSION_SECRET=your_session_secret

### 3 Run the Project

# Navigate into the server subfolder inside Chiro360

cd ../Server

# Run the below script

sudo npm run start-project

### 4 View the Web Application hosted locally

http://localhost:5173/
