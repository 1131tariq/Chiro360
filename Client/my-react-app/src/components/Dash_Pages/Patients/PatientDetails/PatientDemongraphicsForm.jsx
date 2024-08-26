import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

function PatientDemographicsForm({ executeQuery, patient }) {
  const [patientData, setPatientData] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (patient) {
      const formattedDate = patient.dateofbirth
        ? new Date(patient.dateofbirth).toISOString().split("T")[0]
        : "";

      setPatientData({
        ...patient,
        dateofbirth: formattedDate,
        email: patient.contactinfo?.email || "",
        phone: patient.contactinfo?.phone || "",
        address: patient.contactinfo?.address || {},
      });
    }
  }, [patient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "phone") {
      // Update contactinfo fields
      setPatientData((prevData) => ({
        ...prevData,
        contactinfo: {
          ...prevData.contactinfo,
          [name]: value,
        },
      }));
    } else if (["zip", "city", "state", "street"].includes(name)) {
      // Update address fields inside contactinfo
      setPatientData((prevData) => ({
        ...prevData,
        contactinfo: {
          ...prevData.contactinfo,
          address: {
            ...prevData.contactinfo.address,
            [name]: value,
          },
        },
      }));
    } else {
      setPatientData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleUpdatePatient = async () => {
    try {
      const query = `
        UPDATE patients 
        SET firstname = $1, lastname = $2, dateofbirth = $3, contactinfo = $4 
        WHERE patientid = $5
      `;
      const values = [
        patientData.firstname,
        patientData.lastname,
        patientData.dateofbirth,
        JSON.stringify(patientData.contactinfo),
        patientData.patientid,
      ];
      await executeQuery(query, values, "patients");
      alert("Patient updated successfully!");
    } catch (error) {
      alert("Failed to update patient.");
      console.error(error);
    }
  };

  const handleDeletePatient = async () => {
    try {
      const query = `DELETE FROM patients WHERE patientid = $1`;
      const values = [patient.patientid];
      await executeQuery(query, values, "patients");
      alert("Patient deleted successfully!");
    } catch (error) {
      alert("Failed to delete patient.");
      console.error(error);
    } finally {
      setConfirmationOpen(false);
    }
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="First Name"
              name="firstname"
              value={patientData.firstname || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Last Name"
              name="lastname"
              value={patientData.lastname || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date of Birth"
              name="dateofbirth"
              type="date"
              value={patientData.dateofbirth || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Phone"
              name="phone"
              value={patientData.contactinfo?.phone || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={patientData.contactinfo?.email || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />

            <Typography variant="h6" sx={{ mt: 2 }}>
              Address
            </Typography>
            <TextField
              label="Street"
              name="street"
              value={patientData.contactinfo?.address?.street || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              name="city"
              value={patientData.contactinfo?.address?.city || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="State"
              name="state"
              value={patientData.contactinfo?.address?.state || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Zip"
              name="zip"
              value={patientData.contactinfo?.address?.zip || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdatePatient}
              >
                Update Patient
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setConfirmationOpen(true)}
                sx={{ ml: 2 }}
              >
                Delete Patient
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
      >
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this patient? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeletePatient}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PatientDemographicsForm;
