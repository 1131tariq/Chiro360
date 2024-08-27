import React, { useState } from "react";
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

const NewPatientModal = ({ users, open, onClose, onSave, executeQuery }) => {
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
    provider: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFormData = () => {
    if (Object.values(formData).some((value) => !value)) {
      return "Please fill out all fields.";
    }
    return null;
  };

  const handleSave = async () => {
    const errorMessage = validateFormData();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const query = `
        INSERT INTO patients (
          firstname,
          lastname,
          gender,
          dateofbirth,
          contactinfo,
          assigned_doctor
        )
        VALUES ($1, $2, $3, $4, $5, $6)
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
        formData.provider,
      ];
      await executeQuery(query, values, "patients");
      setSuccess("Patient created successfully.");
      onSave(); // Notify the parent component
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
      }); // Reset the form
    } catch (error) {
      setError("Error creating patient. Please try again.");
      console.error("Error creating patient:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Patient</DialogTitle>
      <DialogContent>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <form>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Zip Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Provider</InputLabel>
            <Select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
            >
              {users
                .filter(
                  (user) =>
                    user.user_kind !== "Administrative only" &&
                    user.user_kind !== "Call Agent"
                )
                .map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstname} {user.lastname}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewPatientModal;
