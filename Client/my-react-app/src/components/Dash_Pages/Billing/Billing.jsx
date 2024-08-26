import React, { useState, useMemo, useEffect } from "react";
import {
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import PropTypes from "prop-types";

const invoiceStatusOptions = ["Paid", "Due", "Not Issued"];
const caseTypeOptions = ["Cash", "Insurance"];
const statusOptions = [
  "Completed",
  "Scheduled",
  "Drafted",
  "Assigned",
  "Arrived",
  "Arrived as Walk-in",
  "Cancelled",
];

function Billing({ patients, appointments, executeQuery }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateFilter, setDateFilter] = useState("");
  const [sortField, setSortField] = useState("amount");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("");
  const [editedAppointment, setEditedAppointment] = useState(null);

  useEffect(() => {
    if (selectedAppointment) {
      setEditedAppointment({ ...selectedAppointment });
    }
  }, [selectedAppointment]);

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleSortChange = (e) => setSortOrder(e.target.value);
  const handleDateFilterChange = (e) => setDateFilter(e.target.value);
  const handleSortFieldChange = (e) => setSortField(e.target.value);
  const handleInvoiceStatusFilterChange = (e) =>
    setInvoiceStatusFilter(e.target.value);
  const handleCaseTypeFilterChange = (e) => setCaseTypeFilter(e.target.value);
  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
    setEditedAppointment(null);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (selectedAppointment && executeQuery) {
      try {
        const query = `
          UPDATE appointments
          SET case_type = $1, invoice_status = $2, status = $3
          WHERE appointment_id = $4
        `;
        const params = [
          editedAppointment.case_type,
          editedAppointment.invoice_status,
          editedAppointment.status,
          selectedAppointment.appointment_id,
        ];

        const response = await executeQuery(query, params, "appointments");

        if (response.error) {
          console.error("Update failed:", response.error);
        } else {
          console.log("Update successful:", response);
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    }
    handleCloseModal();
  };

  // Helper to find patient name by patient_id
  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.patientid === patientId);
    return patient ? `${patient.firstname} ${patient.lastname}` : "Unknown";
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) => appointment.amount && appointment.amount.trim() !== ""
      ) // Ensure amount is present
      .filter((appointment) => {
        const patientName = getPatientName(appointment.patient_id);
        return (
          `${appointment.appointment_id} ${appointment.amount} ${appointment.type} ${appointment.status} ${patientName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) &&
          (dateFilter
            ? appointment.appointment_date &&
              appointment.appointment_date.startsWith(dateFilter)
            : true) &&
          (invoiceStatusFilter
            ? appointment.invoice_status === invoiceStatusFilter
            : true) &&
          (caseTypeFilter ? appointment.case_type === caseTypeFilter : true)
        );
      })
      .sort((a, b) => {
        if (sortField === "amount") {
          return sortOrder === "asc"
            ? parseFloat(a.amount) - parseFloat(b.amount)
            : parseFloat(b.amount) - parseFloat(a.amount);
        } else if (sortField === "date") {
          return sortOrder === "asc"
            ? new Date(a.appointment_date) - new Date(b.appointment_date)
            : new Date(b.appointment_date) - new Date(a.appointment_date);
        }
        return 0;
      });
  }, [
    appointments,
    patients,
    searchTerm,
    dateFilter,
    sortField,
    sortOrder,
    invoiceStatusFilter,
    caseTypeFilter,
  ]);

  const getRowColor = (status) => {
    switch (status) {
      case "Paid":
        return "#d4edda"; // Green
      case "Due":
        return "#cce5ff"; // Blue
      case "Not Issued":
        return "#e2e3e5"; // Grey
      default:
        return "transparent"; // Default color
    }
  };

  return (
    <div>
      {/* Appointment Table */}
      <Paper style={{ padding: "16px" }}>
        <Typography variant="h6" gutterBottom>
          Invoices
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          gap={2}
          marginBottom={2}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: "1 1 auto" }}
          />
          <FormControl style={{ flex: "1 1 auto" }}>
            <InputLabel>Sort Field</InputLabel>
            <Select value={sortField} onChange={handleSortFieldChange}>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </FormControl>
          <FormControl style={{ flex: "1 1 auto" }}>
            <InputLabel>Sort Order</InputLabel>
            <Select value={sortOrder} onChange={handleSortChange}>
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Date Filter"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dateFilter}
            onChange={handleDateFilterChange}
            style={{ flex: "1 1 auto" }}
          />
          <FormControl style={{ flex: "1 1 auto" }}>
            <InputLabel>Invoice Status</InputLabel>
            <Select
              value={invoiceStatusFilter}
              onChange={handleInvoiceStatusFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {invoiceStatusOptions.map((status, index) => (
                <MenuItem key={index} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ flex: "1 1 auto" }}>
            <InputLabel>Case Type</InputLabel>
            <Select
              value={caseTypeFilter}
              onChange={handleCaseTypeFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {caseTypeOptions.map((type, index) => (
                <MenuItem key={index} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Appointment ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Invoice Status</TableCell>
              <TableCell>Case Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow
                  key={appointment.appointment_id}
                  hover
                  onClick={() => handleRowClick(appointment)}
                  // style={{ cursor: "pointer" }}
                  style={{
                    cursor: "pointer",
                    backgroundColor: getRowColor(appointment.invoice_status), // Apply row color
                  }}
                >
                  <TableCell>{appointment.appointment_id}</TableCell>
                  <TableCell>${appointment.amount}</TableCell>
                  <TableCell>{appointment.appointment_type}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                  <TableCell>
                    {new Date(
                      appointment.appointment_date
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getPatientName(appointment.patient_id)}
                  </TableCell>
                  <TableCell>{appointment.invoice_status}</TableCell>
                  <TableCell>{appointment.case_type}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>No appointments found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Appointment Details Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            {selectedAppointment && editedAppointment && (
              <Box>
                <Typography variant="h6">Appointment Details</Typography>
                <TextField
                  label="Date"
                  type="date"
                  value={new Date(
                    selectedAppointment.appointment_date
                  ).toLocaleDateString("en-CA")}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Case Type</InputLabel>
                  <Select
                    name="case_type"
                    value={editedAppointment.case_type || ""}
                    onChange={handleInputChange}
                  >
                    {caseTypeOptions.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Invoice Status</InputLabel>
                  <Select
                    name="invoice_status"
                    value={editedAppointment.invoice_status || ""}
                    onChange={handleInputChange}
                  >
                    {invoiceStatusOptions.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editedAppointment.status || ""}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
            <Button onClick={handleCloseModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}

// PropTypes validation
Billing.propTypes = {
  patients: PropTypes.array.isRequired,
  appointments: PropTypes.array.isRequired,
  executeQuery: PropTypes.func.isRequired,
};

export default Billing;
