import React, { useState, useEffect } from "react";
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import PropTypes from "prop-types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const caseTypeOptions = ["Cash", "Insurance"];
const invoiceStatusOptions = ["Paid", "Due", "Not Issued"];
const statusOptions = [
  "Completed",
  "Scheduled",
  "Drafted",
  "Assigned",
  "Arrived",
  "Arrived as Walk-in",
  "Cancelled",
];

const PatientVisits = ({
  soaps = [],
  patient,
  attendedAppointments = [],
  userinfo,
  executeQuery,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [expandedSoapId, setExpandedSoapId] = useState(null);
  const [editedAppointment, setEditedAppointment] = useState(null);

  useEffect(() => {
    if (selectedAppointment) {
      setEditedAppointment({ ...selectedAppointment });
    }
  }, [selectedAppointment]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setExpandedSoapId(null); // Reset expanded soap
    setOpenModal(true);
  };

  const handleToggleExpand = (soapId) => {
    setExpandedSoapId(expandedSoapId === soapId ? null : soapId);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAppointment(null);
    setExpandedSoapId(null);
    setEditedAppointment(null); // Reset the edited appointment
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Attended Visits</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Case Type</TableCell>
            <TableCell>Invoice Status</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>View Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendedAppointments.map((appointment, index) => (
            <TableRow key={index}>
              <TableCell>
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{appointment.case_type}</TableCell>
              <TableCell>{appointment.invoice_status}</TableCell>
              <TableCell>{appointment.status || "No status"}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleViewDetails(appointment)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
              {userinfo.user_kind !== "Call Agent" &&
                userinfo.user_kind !== "Administrative only" && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Associated Soaps
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {soaps.filter(
                        (soap) =>
                          soap.appointment_id ===
                          selectedAppointment.appointment_id
                      ).length > 0 ? (
                        soaps
                          .filter(
                            (soap) =>
                              soap.appointment_id ===
                              selectedAppointment.appointment_id
                          )
                          .map((soap, index) => (
                            <Card key={index} sx={{ width: 300, mb: 2 }}>
                              <CardContent>
                                <Typography variant="h6">
                                  SOAP ID: {soap.id}
                                </Typography>
                                <Typography>
                                  Status: {soap.status || "No status"}
                                </Typography>
                                <IconButton
                                  onClick={() => handleToggleExpand(soap.id)}
                                  aria-expanded={expandedSoapId === soap.id}
                                  aria-label="show more"
                                >
                                  {expandedSoapId === soap.id ? (
                                    <ExpandLessIcon />
                                  ) : (
                                    <ExpandMoreIcon />
                                  )}
                                </IconButton>
                                <Collapse
                                  in={expandedSoapId === soap.id}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <Box sx={{ mt: 2 }}>
                                    <Typography>
                                      <strong>Subjective:</strong>{" "}
                                      {soap.subjective || "No data"}
                                    </Typography>
                                    <Typography>
                                      <strong>Objective:</strong>{" "}
                                      {soap.objective || "No data"}
                                    </Typography>
                                    <Typography>
                                      <strong>Assessment:</strong>{" "}
                                      {soap.assessment || "No data"}
                                    </Typography>
                                    <Typography>
                                      <strong>Plan:</strong>{" "}
                                      {soap.plan || "No data"}
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </CardContent>
                            </Card>
                          ))
                      ) : (
                        <Typography>
                          No soaps associated with this appointment.
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {userinfo.user_kind !== "Call Agent" && (
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          )}
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Add PropTypes for validation
PatientVisits.propTypes = {
  soaps: PropTypes.array,
  patient: PropTypes.object.isRequired,
  attendedAppointments: PropTypes.array,
  executeQuery: PropTypes.func.isRequired,
};

export default PatientVisits;
