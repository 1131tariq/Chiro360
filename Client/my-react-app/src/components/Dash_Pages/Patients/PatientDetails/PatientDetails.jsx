import React, { useState } from "react";
import { Typography, Box, Paper, Grid, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import PatientGrid from "./PatientGrid";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function PatientDetails({
  users,
  userinfo,
  executeQuery,
  appointments,
  patient,
  soaps,
}) {
  if (!patient) {
    return <Typography>Select a Patient to view their records</Typography>;
  }

  const patientAppointments = appointments.filter(
    (appointment) => appointment.patient_id == patient.patientid
  );

  const assignedDoctor = users.find(
    (user) => user.id === patient.assigned_doctor
  );

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body1">
              <strong>Name:</strong> {patient.firstname || "N/A"}{" "}
              {patient.lastname}
              {" | ID: "} {patient.patientid}
            </Typography>
            <Typography variant="body1">
              <strong>Date of Birth:</strong>{" "}
              {patient.dateofbirth
                ? new Date(patient.dateofbirth).toLocaleDateString("en-GB")
                : "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {patient.contactinfo?.phone || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {patient.contactinfo?.email || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Assigned Doctor:</strong>{" "}
              {assignedDoctor
                ? `${assignedDoctor.title} ${assignedDoctor.firstname} ${assignedDoctor.lastname}`
                : "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3}></Grid>
        </Grid>
      </Box>
      <PatientGrid
        patient={patient}
        soaps={soaps}
        users={users}
        userinfo={userinfo}
        appointments={patientAppointments}
        executeQuery={executeQuery}
      />
    </div>
  );
}

export default PatientDetails;
