import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import moment from "moment";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme, appointmentStatus }) => ({
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  backgroundColor: (() => {
    switch (appointmentStatus) {
      case "Assigned":
        return "#fff3e0"; // light orange for "Assigned"
      case "Arrived":
      case "Arrived as Walk-in":
        return "#e0f7fa"; // light cyan for "Arrived"
      case "Drafted":
        return "#f3e5f5"; // light purple for "Drafted"
      default:
        return "";
    }
  })(),
}));

const IncompleteSOAPCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  backgroundColor: "#ffcdd2", // light red for incomplete SOAPs
}));

function SOAPQueue({
  appointments,
  userinfo,
  users,
  patients,
  soaps,
  onAppointmentClick,
}) {
  const formatDate = (dateString) => {
    return moment(dateString).local().format("YYYY-MM-DD");
  };

  const isAdminUserKind = userinfo.user_kind === "Administrative only";

  const filteredUsers = users.filter(
    (user) => user.branch_id === userinfo.branch_id
  );

  const hasAssignedAppointments = (userId) => {
    return appointments.some(
      (appointment) =>
        appointment.provider_id === userId &&
        (appointment.status === "Assigned" ||
          appointment.status === "Arrived" ||
          appointment.status === "Arrived as Walk-in" ||
          appointment.status === "Drafted")
    );
  };

  const usersWithIncompleteSOAPs = filteredUsers.filter((user) => {
    const userAppointments = appointments.filter(
      (appointment) => appointment.provider_id === user.id
    );

    return userAppointments.some((appointment) => {
      const soapForAppointment = soaps.find(
        (soap) => soap.appointment_id === appointment.appointment_id
      );
      return (
        appointment.status === "Completed" &&
        (!soapForAppointment || soapForAppointment.status !== "Complete")
      );
    });
  });

  const displayedUsers = filteredUsers.filter((user) => {
    const hasAssigned = hasAssignedAppointments(user.id);
    const hasIncompleteSOAP = usersWithIncompleteSOAPs.some(
      (incompleteUser) => incompleteUser.id === user.id
    );
    return hasAssigned || hasIncompleteSOAP;
  });

  const displayedUsersForCurrentUser = isAdminUserKind
    ? displayedUsers
    : displayedUsers.filter((user) => user.id === userinfo.id);

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Appointment Queue
      </Typography>

      {displayedUsersForCurrentUser.length > 0 ? (
        displayedUsersForCurrentUser.map((user) => (
          <Accordion key={user.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${user.id}-content`}
              id={`panel${user.id}-header`}
            >
              {user.title} {user.firstname} {user.lastname}
            </AccordionSummary>
            <AccordionDetails>
              <div>
                {/* Display assigned appointments */}
                {appointments
                  .filter((appointment) => {
                    const matchesProvider = appointment.provider_id === user.id;
                    const matchesStatus =
                      appointment.status === "Assigned" ||
                      appointment.status === "Arrived" ||
                      appointment.status === "Arrived as Walk-in" ||
                      appointment.status === "Drafted";
                    return matchesProvider && matchesStatus;
                  })
                  .map((appointment) => {
                    const matchedPatient = patients.find(
                      (patient) => patient.patientid === appointment.patient_id
                    );

                    return (
                      <StyledCard
                        key={appointment.appointment_id}
                        appointmentStatus={appointment.status}
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <CardContent>
                          <Typography>
                            Patient:{" "}
                            {matchedPatient
                              ? `${matchedPatient.firstname} ${matchedPatient.lastname}`
                              : "Unknown"}
                          </Typography>
                          <Typography>
                            Time: {formatDate(appointment.appointment_date)}
                          </Typography>
                          <Typography>
                            Type: {appointment.appointment_type}
                          </Typography>
                        </CardContent>
                      </StyledCard>
                    );
                  })}
                {appointments.filter((appointment) => {
                  const matchesProvider = appointment.provider_id === user.id;
                  const matchesStatus =
                    appointment.status === "Assigned" ||
                    appointment.status === "Arrived" ||
                    appointment.status === "Arrived as Walk-in" ||
                    appointment.status === "Drafted";
                  return matchesProvider && matchesStatus;
                }).length === 0 && (
                  <Typography>No assigned appointments</Typography>
                )}
              </div>
            </AccordionDetails>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="incomplete-soaps-content"
                id="incomplete-soaps-header"
              >
                Incomplete SOAPs
              </AccordionSummary>
              <AccordionDetails>
                <div>
                  {appointments
                    .filter((appointment) => {
                      const soapForAppointment = soaps.find(
                        (soap) =>
                          soap.appointment_id === appointment.appointment_id
                      );
                      return (
                        appointment.provider_id === user.id &&
                        appointment.status === "Completed" &&
                        (!soapForAppointment ||
                          soapForAppointment.status !== "Complete")
                      );
                    })
                    .map((appointment) => {
                      const matchedPatient = patients.find(
                        (patient) =>
                          patient.patientid === appointment.patient_id
                      );

                      return (
                        <IncompleteSOAPCard
                          key={appointment.appointment_id}
                          onClick={() => onAppointmentClick(appointment)}
                        >
                          <CardContent>
                            <Typography>
                              Patient:{" "}
                              {matchedPatient
                                ? `${matchedPatient.firstname} ${matchedPatient.lastname}`
                                : "Unknown"}
                            </Typography>
                            <Typography>
                              Time: {formatDate(appointment.appointment_date)}
                            </Typography>
                            <Typography>
                              Type: {appointment.appointment_type}
                            </Typography>
                          </CardContent>
                        </IncompleteSOAPCard>
                      );
                    })}
                  {appointments.filter((appointment) => {
                    const soapForAppointment = soaps.find(
                      (soap) =>
                        soap.appointment_id === appointment.appointment_id
                    );
                    return (
                      appointment.provider_id === user.id &&
                      appointment.status === "Completed" &&
                      (!soapForAppointment ||
                        soapForAppointment.status !== "Complete")
                    );
                  }).length === 0 && (
                    <Typography>No incomplete SOAPs</Typography>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          </Accordion>
        ))
      ) : (
        <Typography>
          No users with assigned appointments or incomplete SOAPs
        </Typography>
      )}
    </div>
  );
}

export default SOAPQueue;
