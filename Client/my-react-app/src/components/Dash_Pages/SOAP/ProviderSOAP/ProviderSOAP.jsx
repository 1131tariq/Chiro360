import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";
import { styled } from "@mui/material/styles";
import SOAPQueue from "./SOAPQueue/SOAPQueue";
import SOAPNote from "./SOAPNote/SOAPNote";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

function ProviderSOAP({
  patients,
  cptCodes,
  userinfo,
  executeQuery,
  appointments,
  users,
  soaps,
  selectedDate,
  setSelectedDate,
}) {
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [soapId, setSoapId] = useState(null); // Track SOAP ID
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("Draft"); // Default status is Draft

  const handleAppointmentClick = (appointment) => {
    const patient = patients.find(
      (p) => p.patientid === appointment.patient_id
    );
    setSelectedAppointment(appointment);
    setSelectedPatient(patient);

    // Find SOAP note for the current appointment
    const existingSOAP = soaps.find(
      (soap) => soap.appointment_id === appointment.appointment_id
    );

    if (existingSOAP) {
      setSubjective(existingSOAP.subjective);
      setObjective(existingSOAP.objective);
      setAssessment(existingSOAP.assessment);
      setPlan(existingSOAP.plan);
      setStatus(existingSOAP.status);
      setSoapId(existingSOAP.id); // Set the SOAP ID for updates
    } else {
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      setStatus("");
      setSoapId(""); // Set the SOAP ID for updates
    }

    console.log(soapId);
  };

  const resetSelection = () => {
    setSelectedAppointment(null);
    setSelectedPatient(null);
    setSubjective(null);
    setObjective(null);
    setAssessment(null);
    setPlan(null);
    setStatus(null);
    setSoapId(null); // Set the SOAP ID for updates
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={2}>
            <SOAPQueue
              users={users}
              userinfo={userinfo}
              soaps={soaps}
              setSoapId={setSoapId}
              appointments={appointments}
              selectedDate={selectedDate}
              patients={patients}
              onAppointmentClick={handleAppointmentClick}
            />
          </Grid>
          <Grid xs={10}>
            <SOAPNote
              soaps={soaps}
              soapId={soapId}
              setSubjective={setSubjective}
              setObjective={setObjective}
              setAssessment={setAssessment}
              setPlan={setPlan}
              setStatus={setStatus}
              subjective={subjective}
              objective={objective}
              assessment={assessment}
              plan={plan}
              appointment={selectedAppointment}
              status={status}
              patient={selectedPatient}
              cptCodes={cptCodes}
              executeQuery={executeQuery}
              onSubmit={resetSelection} // Pass the reset function
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

export default ProviderSOAP;
