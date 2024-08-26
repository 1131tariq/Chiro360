import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Add Material-UI Edit icon

export default function PatientFutureVisits({
  users,
  patient,
  futureAppointments,
  executeQuery,
}) {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);

  // Function to find the provider's name by ID
  const getProviderName = (providerId) => {
    const provider = users.find((user) => user.id === providerId);
    return provider ? provider.firstname : "Unknown";
  };

  // Open modal with the selected appointment data
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setSelectedAppointment(null);
  };

  // Handle appointment update
  const handleUpdate = async () => {
    const {
      appointment_id,
      appointment_date,
      appointment_time,
      appointment_end_time,
      appointment_type,
      case_type,
      status,
    } = selectedAppointment;

    const query = `
      UPDATE appointments
      SET appointment_date = $1,
          appointment_time = $2,
          appointment_end_time = $3,
          appointment_type = $4,
          case_type = $5,
          status = $6
      WHERE appointment_id = $7
    `;
    const values = [
      appointment_date,
      appointment_time,
      appointment_end_time,
      appointment_type,
      case_type,
      status,
      appointment_id,
    ];

    try {
      await executeQuery(query, values, "appointments");
      handleClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  // Handle appointment deletion
  const handleDelete = async () => {
    const query = `DELETE FROM appointments WHERE appointment_id = $1`;
    const values = [selectedAppointment.appointment_id];

    try {
      await executeQuery(query, values, "appointments");
      handleClose();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Future Appointments</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Appointment Type</TableCell>
            <TableCell>Case Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {futureAppointments.map((appointment, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(appointment.appointment_date).toLocaleDateString(
                  "en-CA"
                )}
              </TableCell>
              <TableCell>{getProviderName(appointment.provider_id)}</TableCell>
              <TableCell>{appointment.appointment_type}</TableCell>
              <TableCell>{appointment.case_type}</TableCell>
              <TableCell>{appointment.status}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEditClick(appointment)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal for editing or deleting appointments */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Date"
                type="date"
                value={new Date(
                  selectedAppointment.appointment_date
                ).toLocaleDateString("en-CA")}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    appointment_date: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Start Time"
                type="time"
                value={selectedAppointment.appointment_time}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    appointment_time: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="End Time"
                type="time"
                value={selectedAppointment.appointment_end_time}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    appointment_end_time: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Appointment Type"
                value={selectedAppointment.appointment_type}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    appointment_type: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Case Type"
                value={selectedAppointment.case_type}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    case_type: e.target.value,
                  })
                }
                fullWidth
              />
              <TextField
                label="Status"
                value={selectedAppointment.status}
                onChange={(e) =>
                  setSelectedAppointment({
                    ...selectedAppointment,
                    status: e.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
