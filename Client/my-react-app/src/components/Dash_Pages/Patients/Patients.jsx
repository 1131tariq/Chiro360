import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import PatientSearch from "./PatientSearch/PatientSearch";
import PatientDetails from "./PatientDetails/PatientDetails";

function Patients({
  soaps,
  users,
  userinfo,
  executeQuery,
  patients,
  appointments,
}) {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={2}>
            <PatientSearch
              patients={patients}
              userinfo={userinfo}
              executeQuery={executeQuery}
              setSelectedPatient={setSelectedPatient}
              selectedPatient={selectedPatient}
              users={users}
            />
          </Grid>
          <Grid xs={10}>
            <PatientDetails
              users={users}
              soaps={soaps}
              userinfo={userinfo}
              appointments={appointments}
              executeQuery={executeQuery}
              patient={selectedPatient}
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default Patients;
