import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import moment from "moment";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";

// Define the color codes for each status
const statusColors = {
  Scheduled: "#ADD8E6", // Light Blue
  Arrived: "#AAFF00", // Bright Green
  "Arrived as Walk-in": "#AAFF00", // Bright Green
  Assigned: "#FFA500", // Orange
  Drafted: "#0000FF", // Blue
  Completed: "#0BDA51", // Green
  Cancelled: "#FF0000", // Red
};

function AppointmentQueue({
  selectedDate,
  appointments,
  userinfo,
  users,
  patients,
}) {
  const filteredUsers = users.filter(
    (user) =>
      user.branch_id === userinfo.branch_id &&
      user.user_kind !== "Administrative only" &&
      user.user_kind !== "Call Agent"
  );

  const formatDate = (dateString) => {
    return moment(dateString).local().format("YYYY-MM-DD");
  };

  const isSameDate = (date1, date2) => {
    return moment(date1).isSame(date2, "day");
  };

  const isAdministrativeOnly =
    userinfo.user_kind === "Administrative only" ||
    userinfo.user_kind === "Call Agent";

  const getUserAppointments = (userId) => {
    return appointments.filter(
      (appointment) =>
        appointment.provider_id === userId &&
        (!selectedDate ||
          isSameDate(formatDate(appointment.appointment_date), selectedDate))
    );
  };

  const categorizeAppointmentsByStatus = (appointments) => {
    return appointments.reduce((acc, appointment) => {
      const status = appointment.status || "Unknown";
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(appointment);
      return acc;
    }, {});
  };

  const renderAppointmentCard = (appointment) => {
    const matchedPatient = patients.find(
      (patient) => patient.patientid === appointment.patient_id
    );

    const cardColor = statusColors[appointment.status] || "#FFFFFF"; // Default to white if status not found

    return (
      <Grid item xs={12} key={appointment.appointment_id}>
        <Card style={{ backgroundColor: cardColor }}>
          <CardContent>
            <Typography variant="subtitle1">
              Patient:{" "}
              {matchedPatient
                ? matchedPatient.firstname + " " + matchedPatient.lastname
                : "Unknown"}
            </Typography>
            <Typography>Type: {appointment.appointment_type}</Typography>
            <Typography>Time: {appointment.appointment_time}</Typography>
            <Typography>Status: {appointment.status}</Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderStatusAccordion = (appointmentsByStatus) => {
    return Object.keys(appointmentsByStatus).map((status) => (
      <Accordion key={status}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel-${status}-content`}
          id={`panel-${status}-header`}
        >
          <Typography>{status}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {appointmentsByStatus[status].map(renderAppointmentCard)}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Appointment Queue
      </Typography>

      {isAdministrativeOnly ? (
        filteredUsers.map((user) => {
          const appointmentsByStatus = categorizeAppointmentsByStatus(
            getUserAppointments(user.id)
          );

          return (
            <Accordion key={user.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${user.id}-content`}
                id={`panel${user.id}-header`}
              >
                {user.title} {user.firstname} {user.lastname}
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(appointmentsByStatus).length > 0 ? (
                  renderStatusAccordion(appointmentsByStatus)
                ) : (
                  <Typography>No appointments for this date</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })
      ) : (
        <Accordion key={userinfo.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${userinfo.id}-content`}
            id={`panel${userinfo.id}-header`}
          >
            {userinfo.title} {userinfo.firstname} {userinfo.lastname}
          </AccordionSummary>
          <AccordionDetails>
            {Object.keys(
              categorizeAppointmentsByStatus(getUserAppointments(userinfo.id))
            ).length > 0 ? (
              renderStatusAccordion(
                categorizeAppointmentsByStatus(getUserAppointments(userinfo.id))
              )
            ) : (
              <Typography>No appointments for this date</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
}

export default AppointmentQueue;
