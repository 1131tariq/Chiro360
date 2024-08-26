import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import moment from "moment";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  minHeight: "120px",
  marginBottom: theme.spacing(1),
  cursor: "pointer",
}));

function FlowGrid({
  users,
  userinfo,
  soaps,
  appointments,
  patients,
  selectedDate,
  executeQuery,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);

  const handleMoreInfoClick = (event, appointment) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return;

    // Update the appointment status
    await executeQuery(
      `UPDATE appointments SET status = '${status}' WHERE appointment_id = ${selectedAppointment.appointment_id}`,
      [],
      "appointments"
    );
  };

  const formatDate = (dateString) => {
    return moment(dateString).local().format("YYYY-MM-DD");
  };

  const isSameDate = (date1, date2) => {
    return moment(date1).isSame(date2, "day");
  };

  const formattedSelectedDate = moment(selectedDate)
    .local()
    .format("YYYY-MM-DD");

  const isAdmin = userinfo.user_kind === "Administrative only";

  // Filter appointments based on user type
  const filteredAppointments = isAdmin
    ? appointments.filter((appointment) => {
        const provider = users.find(
          (user) => user.id === appointment.provider_id
        );
        return provider && provider.branch_id === userinfo.branch_id;
      })
    : appointments.filter(
        (appointment) => appointment.provider_id === userinfo.id
      );

  const categorizedAppointments = {
    Scheduled: filteredAppointments.filter((a) => a.status === "Scheduled"),
    Arrived: filteredAppointments.filter(
      (a) => a.status === "Arrived" || a.status === "Arrived as Walk-in"
    ),
    Assigned: filteredAppointments.filter((a) => a.status === "Assigned"),
    Drafted: filteredAppointments.filter((a) => a.status === "Drafted"),
    Completed: filteredAppointments.filter((a) => a.status === "Completed"),
    Cancelled: filteredAppointments.filter((a) => a.status === "Cancelled"),
  };

  const filterByDate = (appointments) => {
    return appointments.filter((appointment) =>
      isSameDate(
        formatDate(appointment.appointment_date),
        formattedSelectedDate
      )
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {Object.keys(categorizedAppointments).map((status) => (
          <Grid item xs={2} key={status}>
            <Item>
              <Typography variant="h6">{status}</Typography>
              {filterByDate(categorizedAppointments[status]).map(
                (appointment) => {
                  const matchedPatient = patients.find(
                    (patient) => patient.patientid === appointment.patient_id
                  );

                  return (
                    <AppointmentCard key={appointment.appointment_id}>
                      <CardContent>
                        <Typography variant="body2">
                          Type: {appointment.appointment_type}
                        </Typography>
                        <Typography variant="body2">
                          Patient:{" "}
                          {matchedPatient
                            ? matchedPatient.firstname
                            : "Unknown"}
                        </Typography>
                        <Typography variant="body2">
                          Date:{" "}
                          {moment(appointment.appointment_date).format(
                            "YYYY-MM-DD"
                          )}
                        </Typography>
                        <Typography variant="body2">
                          Time: {appointment.appointment_time}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={(event) =>
                            handleMoreInfoClick(event, appointment)
                          }
                        >
                          More Info
                        </Button>
                      </CardActions>
                    </AppointmentCard>
                  );
                }
              )}
              {filterByDate(categorizedAppointments[status]).length === 0 && (
                <Typography variant="body2">No appointments</Typography>
              )}
            </Item>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleUpdateStatus("Scheduled")}>
          Schedule
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus("Arrived")}>
          Arrive
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus("Arrived as Walk-in")}>
          Arrived as Walk-in
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus("Assigned")}>
          Assign
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus("Completed")}>
          Complete
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus("Cancelled")}>
          Cancel
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default FlowGrid;
