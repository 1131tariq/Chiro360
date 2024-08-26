import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const appointmentTypes = [
  "Adjustment",
  "New Patient",
  "Report of Findings",
  "Xray",
  "Xray Follow up",
  "Re-Exam",
  "Financial Consultation",
];

const recurrenceOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const caseTypes = [
  { value: "Cash", label: "Cash" },
  { value: "Insurance", label: "Insurance" },
];

const PatientScheduling = ({
  executeQuery,
  patient,
  users,
  userinfo,
  appointments,
}) => {
  const [formData, setFormData] = useState({
    appointmentType: "",
    provider: "",
    startTime: "",
    endTime: "",
    recurrence: "",
    recurrenceEndDate: null,
    recurring: false,
    caseType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [providerBranchId, setProviderBranchId] = useState(null);

  useEffect(() => {
    const filteredProviders = users.filter(
      (user) =>
        user.user_kind !== "Administrative only" &&
        user.branch_id === userinfo.branch_id
    );
    setAvailableProviders(filteredProviders);
    if (userinfo.user_kind !== "Administrative only") {
      setFormData((prev) => ({
        ...prev,
        provider: userinfo.id,
      }));
      const selectedProvider = filteredProviders.find(
        (provider) => provider.id === userinfo.id
      );
      if (selectedProvider) {
        setProviderBranchId(selectedProvider.branch_id);
      }
    }
  }, [users, userinfo]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "provider") {
      const selectedProvider = users.find((user) => user.id === value);
      if (selectedProvider) {
        setProviderBranchId(selectedProvider.branch_id);
      }
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleRecurrenceChange = (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      recurrence: value,
      recurring: value !== "",
    }));
  };

  const validateFormData = () => {
    const {
      appointmentType,
      provider,
      startTime,
      endTime,
      recurrence,
      recurrenceEndDate,
      caseType,
    } = formData;
    if (!appointmentType || !provider || !startTime || !endTime || !caseType) {
      return "Please fill out all required fields for the appointment.";
    }
    if (
      recurrenceEndDate &&
      dayjs(recurrenceEndDate).isBefore(dayjs(startTime))
    ) {
      return "Recurrence end date cannot be earlier than start date.";
    }
    return null;
  };

  const checkForConflicts = (newStart, newEnd) => {
    const filteredAppointments = appointments.filter(
      (appointment) => appointment.provider_id === formData.provider
    );
    return filteredAppointments.some((appointment) => {
      const existingStart = dayjs(
        `${appointment.appointment_date} ${appointment.appointment_time}`
      );
      const existingEnd = dayjs(
        `${appointment.appointment_date} ${appointment.appointment_end_time}`
      );
      return newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);
    });
  };

  const generateAppointments = async () => {
    const { startTime, endTime, recurrence, recurrenceEndDate, provider } =
      formData;
    let currentStartDate = dayjs(startTime);
    const endDate = dayjs(recurrenceEndDate);

    while (currentStartDate.isBefore(endDate)) {
      const currentEndDate = currentStartDate.add(
        dayjs(endTime).diff(dayjs(startTime)),
        "ms"
      );

      if (checkForConflicts(currentStartDate, currentEndDate)) {
        setError("Conflict detected with existing appointments.");
        return;
      }

      const values = [
        currentStartDate.format("YYYY-MM-DD"),
        currentStartDate.format("HH:mm"),
        currentEndDate.format("HH:mm"),
        formData.appointmentType,
        provider,
        patient.patientid,
        providerBranchId,
        "Scheduled",
        formData.caseType,
      ];
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
          case_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      try {
        await executeQuery(query, values, "appointments");
      } catch (error) {
        console.error("Error creating appointment:", error);
        setError("Error scheduling appointment. Please try again.");
        return;
      }

      switch (recurrence) {
        case "daily":
          currentStartDate = currentStartDate.add(1, "day");
          break;
        case "weekly":
          currentStartDate = currentStartDate.add(1, "week");
          break;
        case "monthly":
          currentStartDate = currentStartDate.add(1, "month");
          break;
        default:
          currentStartDate = endDate;
      }
    }
    setSuccess("Appointments scheduled successfully.");
  };

  const handleCreateAppointment = async () => {
    const errorMessage = validateFormData();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (formData.recurring) {
        await generateAppointments();
      } else {
        const startDate = dayjs(formData.startTime);
        const endDate = dayjs(formData.endTime);

        if (checkForConflicts(startDate, endDate)) {
          setError("Conflict detected with existing appointments.");
          setLoading(false);
          return;
        }

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
            case_type
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const values = [
          startDate.format("YYYY-MM-DD"),
          startDate.format("HH:mm"),
          endDate.format("HH:mm"),
          formData.appointmentType,
          formData.provider,
          patient.patientid,
          providerBranchId,
          "Scheduled",
          formData.caseType,
        ];
        await executeQuery(query, values, "appointments");
        setSuccess("Appointment scheduled successfully.");
      }
    } catch (error) {
      setError("Error scheduling appointment. Please try again.");
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Schedule Appointment
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form>
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
          <InputLabel>Provider</InputLabel>
          <Select
            name="provider"
            value={formData.provider}
            onChange={handleFormChange}
            disabled={userinfo.user_kind !== "Administrative only"}
          >
            {availableProviders.map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                {provider.firstname} ({provider.user_kind})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label="Start Time"
          name="startTime"
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => handleDateChange("startTime", e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="End Time"
          name="endTime"
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => handleDateChange("endTime", e.target.value)}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Case Type</InputLabel>
          <Select
            name="caseType"
            value={formData.caseType}
            onChange={handleFormChange}
          >
            {caseTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Recurring</InputLabel>
          <Select
            name="recurring"
            value={formData.recurring ? "yes" : "no"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                recurring: e.target.value === "yes",
              }))
            }
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </Select>
        </FormControl>
        {formData.recurring && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Recurrence Pattern</InputLabel>
              <Select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleRecurrenceChange}
              >
                {recurrenceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formData.recurrence && (
              <FormControl fullWidth margin="normal">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Recurrence End Date"
                    value={formData.recurrenceEndDate}
                    onChange={(newValue) =>
                      handleDateChange("recurrenceEndDate", newValue)
                    }
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </FormControl>
            )}
          </>
        )}
        <Box mt={2}>
          <Button
            onClick={handleCreateAppointment}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Schedule Appointment"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default PatientScheduling;
