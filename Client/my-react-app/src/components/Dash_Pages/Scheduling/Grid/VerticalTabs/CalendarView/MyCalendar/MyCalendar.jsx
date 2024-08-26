import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import {
  Container,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";

const localizer = momentLocalizer(moment);

// Define colors for each appointment status
const statusColors = {
  Scheduled: "#ADD8E6", // Light Blue
  Arrived: "#AAFF00", // Bright Green
  "Arrived as Walk-in": "#AAFF00", // Bright Green
  Assigned: "#FFA500", // Orange
  Drafted: "#0000FF", // Blue
  Completed: "#0BDA51", // Green
  Cancelled: "#FF0000", // Red
};

const caseTypeOptions = ["Cash", "Insurance"];

const appointmentTypes = [
  "Adjustment",
  "New Patient",
  "Report of Findings",
  "Xray",
  "Xray Follow up",
  "Re-Exam",
  "Financial Consultation",
];

const MyCalendar = ({
  executeQuery,
  soaps,
  selectedDate,
  setSelectedDate,
  appointments,
  users,
  userInfo,
  patients,
}) => {
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState(Views.DAY); // Default to day view
  const [modalOpen, setModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    appointmentType: "",
    provider: "",
    patient: null,
    startTime: "",
    endTime: "",
    caseType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    // Transform and set events when appointments change
    const transformedAppointments = transformAppointments(appointments);
    setEvents(transformedAppointments);
  }, [appointments]);

  const transformAppointments = (appointments) => {
    return appointments.map((appointment) => {
      const start = new Date(appointment.appointment_date);
      const end = new Date(appointment.appointment_date);

      // Adjust time based on appointment_time and appointment_end_time
      const [startHours, startMinutes] = appointment.appointment_time
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = appointment.appointment_end_time
        .split(":")
        .map(Number);

      start.setHours(startHours, startMinutes);
      end.setHours(endHours, endMinutes);

      return {
        id: appointment.appointment_id,
        title: appointment.appointment_type,
        start,
        end,
        resource: {
          status: appointment.status,
          provider: appointment.provider_id,
          patient: appointment.patient_id,
        },
      };
    });
  };

  const EventComponent = ({ event }) => (
    <span>
      <strong>Appointment Type: {event.title}</strong>
      <br />
      <span>
        Status: {event.resource?.status} | Provider:{" "}
        {(() => {
          const provider = users.find(
            (user) => user.id == event.resource?.provider
          );
          return provider
            ? `${provider.firstname} ${provider.lastname}`
            : "Unknown";
        })()}{" "}
        | Patient:{" "}
        {(() => {
          const patient = patients.find(
            (patient) => patient.patientid == event.resource?.patient
          );
          return patient
            ? `${patient.firstname} ${patient.lastname}`
            : "Unknown";
        })()}
      </span>
    </span>
  );

  const handleSelectSlot = ({ start, end }) => {
    setFormData((prev) => ({
      ...prev,
      startTime: moment(start).format("YYYY-MM-DDTHH:mm"),
      endTime: moment(end).format("YYYY-MM-DDTHH:mm"),
    }));
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setNewPatient(false);
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      dob: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      appointmentType: "",
      provider: "",
      patient: null, // Reset to null
      startTime: "",
      endTime: "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFormData = () => {
    if (newPatient) {
      const {
        firstName,
        lastName,
        dob,
        phone,
        email,
        street,
        city,
        state,
        zip,
      } = formData;
      if (
        !firstName ||
        !lastName ||
        !dob ||
        !phone ||
        !email ||
        !street ||
        !city ||
        !state ||
        !zip
      ) {
        return "Please fill out all required fields for the new patient.";
      }
    }
    const { appointmentType, provider, startTime, endTime } = formData;
    if (!appointmentType || !provider || !startTime || !endTime) {
      return "Please fill out all required fields for the appointment.";
    }
    return null;
  };

  const handleCreatePatient = async () => {
    const errorMessage = validateFormData();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const query = `
        INSERT INTO patients (
          firstname,
          lastname,
          gender,
          dateofbirth,
          contactinfo
        )
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [
        formData.firstName,
        formData.lastName,
        formData.gender,
        formData.dob,
        {
          email: formData.email,
          phone: formData.phone,
          address: {
            zip: formData.zip,
            city: formData.city,
            state: formData.state,
            street: formData.street,
          },
        },
      ];
      await executeQuery(query, values, "patients");
      setSuccess("Patient created successfully.");
    } catch (error) {
      setError("Error creating patient. Please try again.");
      console.error("Error creating patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasClashingAppointment = () => {
    const { provider, startTime, endTime } = formData;
    const newStart = moment(startTime);
    const newEnd = moment(endTime);

    return appointments.some(
      (appointment) =>
        appointment.provider_id === provider &&
        moment(appointment.appointment_date).isSame(newStart, "day") &&
        (newStart.isBetween(
          moment(appointment.appointment_date).set({
            hour: appointment.appointment_time.split(":")[0],
            minute: appointment.appointment_time.split(":")[1],
          }),
          moment(appointment.appointment_date).set({
            hour: appointment.appointment_end_time.split(":")[0],
            minute: appointment.appointment_end_time.split(":")[1],
          }),
          null,
          "[)"
        ) ||
          newEnd.isBetween(
            moment(appointment.appointment_date).set({
              hour: appointment.appointment_time.split(":")[0],
              minute: appointment.appointment_time.split(":")[1],
            }),
            moment(appointment.appointment_end_time).set({
              hour: appointment.appointment_end_time.split(":")[0],
              minute: appointment.appointment_end_time.split(":")[1],
            }),
            null,
            "(]"
          ) ||
          (newStart.isSameOrBefore(
            moment(appointment.appointment_date).set({
              hour: appointment.appointment_time.split(":")[0],
              minute: appointment.appointment_time.split(":")[1],
            }),
            "["
          ) &&
            newEnd.isSameOrAfter(
              moment(appointment.appointment_date).set({
                hour: appointment.appointment_end_time.split(":")[0],
                minute: appointment.appointment_end_time.split(":")[1],
              }),
              "]"
            )))
    );
  };

  const handleCreateAppointment = async () => {
    const errorMessage = validateFormData();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    const startDateTime = moment(formData.startTime);
    const endDateTime = moment(formData.endTime);

    if (endDateTime.isBefore(startDateTime)) {
      setError("The end time cannot be earlier than the start time.");
      return;
    }

    if (hasClashingAppointment()) {
      alert(
        "There is a scheduling conflict. Please check the dates and times."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [startDate, startTime] = formData.startTime.split("T");
      const [endDate, endTime] = formData.endTime.split("T");
      const patientId = newPatient
        ? formData.patient.patientid
        : formData.patient.patientid;

      const query = `
        INSERT INTO appointments (
          appointment_date,
          appointment_time,
          appointment_end_time,
          appointment_type,
          provider_id,
          patient_id,
          branch_id,
          status,
          invoice_status,
          case_type 
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      `;
      const values = [
        startDate,
        startTime,
        endTime,
        formData.appointmentType,
        formData.provider,
        patientId,
        userInfo.branch_id,
        "Scheduled",
        "Not Issued",
        formData.caseType,
      ];
      await executeQuery(query, values, "appointments");
      setSuccess("Appointment scheduled successfully.");
      handleModalClose();
    } catch (error) {
      setError("Error scheduling appointment. Please try again.");
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatientOnly = () => {
    handleCreatePatient();
  };

  const availableProviders = users.filter(
    (user) =>
      user.user_kind !== "Administrative only" &&
      user.branch_id === userInfo.branch_id
  );

  const handleSelectEvent = (event, e) => {
    if (event.resource.status !== "Complete") {
      setMenuAnchorEl(e.currentTarget);
      setSelectedAppointment(event);
    }
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedAppointment) return;

    try {
      // Update the appointment status
      console.log(status + " " + selectedAppointment.id);
      await executeQuery(
        `UPDATE appointments SET status = '${status}' WHERE appointment_id = ${selectedAppointment.id}`,
        [],
        "appointments"
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    } finally {
      handleCloseMenu();
    }
  };

  return (
    <Container
      maxWidth={false}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        width: "70vw",
      }}
    >
      <Typography variant="h4" component={"span"} gutterBottom>
        Appointments
      </Typography>
      <div style={{ flexGrow: 1, display: "flex" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ flexGrow: 1, width: "100%" }}
          selectable
          view={currentView} // Ensure the current view is passed to the Calendar component
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          date={selectedDate}
          components={{
            event: EventComponent,
          }}
          eventPropGetter={(event) => {
            const backgroundColor =
              statusColors[event.resource.status] || "#3174ad";
            return { style: { backgroundColor } };
          }}
          onNavigate={(date, view) => {
            console.log(`Navigating to date: ${date}, view: ${view}`);
            setSelectedDate(moment(date).format("YYYY-MM-DD"));
          }}
          onView={(view) => {
            console.log(`Changing view to: ${view}`);
            setCurrentView(view); // Update the current view state
          }}
        />
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleUpdateStatus("Scheduled")}>
            Scheduled
          </MenuItem>
          <MenuItem onClick={() => handleUpdateStatus("Arrived")}>
            Arrived
          </MenuItem>
          <MenuItem onClick={() => handleUpdateStatus("Arrived as Walk-in")}>
            Arrived as Walk-in
          </MenuItem>
          <MenuItem onClick={() => handleUpdateStatus("Assigned")}>
            Assigned
          </MenuItem>
          <MenuItem onClick={() => handleUpdateStatus("Completed")}>
            Complete
          </MenuItem>
          <MenuItem onClick={() => handleUpdateStatus("Cancelled")}>
            Cancel
          </MenuItem>
        </Menu>
      </div>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            maxWidth: "800px",
            height: "80vh",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2">
            {newPatient ? "Create New Patient" : "Schedule Appointment"}
          </Typography>
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <form>
            {newPatient ? (
              <>
                <TextField
                  fullWidth
                  margin="normal"
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleFormChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Zip Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </>
            ) : (
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) =>
                    `${option.firstname} ${option.lastname}`
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Patient" />
                  )}
                  value={formData.patient}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      patient: newValue || null,
                    }));
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option?.patientid === value?.patientid
                  }
                />
              </FormControl>
            )}
            <Button onClick={() => setNewPatient(true)} disabled={newPatient}>
              New Patient
            </Button>

            {!newPatient && (
              <div>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Start Time"
                  name="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleFormChange}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="End Time"
                  name="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleFormChange}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleFormChange}
                  >
                    {appointmentTypes.map((type, index) => (
                      <MenuItem key={index} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Case Type</InputLabel>
                  <Select
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleFormChange}
                  >
                    {caseTypeOptions.map((type, index) => (
                      <MenuItem key={index} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Provider</InputLabel>
                  <Select
                    name="provider"
                    value={formData.provider}
                    onChange={handleFormChange}
                  >
                    {availableProviders.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.firstname} ({provider.user_kind})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button onClick={handleModalClose}>Cancel</Button>
              {newPatient ? (
                <Button onClick={handleCreatePatientOnly} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Create Patient"}
                </Button>
              ) : (
                <Button onClick={handleCreateAppointment} disabled={loading}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Schedule Appointment"
                  )}
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
};

export default MyCalendar;
