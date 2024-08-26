import React, { useState, useEffect } from "react";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const RegistrationForm = ({ branches, onClose }) => {
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    userKind: "",
    permissionLevel: "",
    branch: "",
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    permissions: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const addressKey = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressKey]: value,
        },
      }));
    } else if (name === "permissions") {
      const selectedPermissions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prevData) => ({
        ...prevData,
        permissions: selectedPermissions,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/register",
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        console.log("User registered successfully");
        setError(null);
        onClose();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <select
          name="userKind"
          value={formData.userKind}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select User Kind
          </option>
          {[
            "Administrative only",
            "Call Agent",
            "Chiropractor",
            "Massage Therapist",
            "Nutritionist",
            "Acupuncturist",
            "Phlebotomist",
            "Neurofeedback",
            "Stretch Therapist",
            "Nurse Practitioner",
            "Medical Doctor",
            "Medical Assistant",
            "Physician Assistant",
            "Mental Health",
            "General Provider",
          ].map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>

        <select
          name="permissionLevel"
          value={formData.permissionLevel}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Permission Level
          </option>
          {["System Admin", "Location Admin", "Location User"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <select
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Branch
          </option>
          {branches.map((branch) => (
            <option key={branch.branch_id} value={branch.branch_id}>
              {branch.branch_name}
            </option>
          ))}
        </select>

        <select
          name="permissions"
          value={formData.permissions}
          onChange={handleChange}
          multiple
        >
          <option value="" disabled>
            Select Permissions
          </option>
          <option value="textReminders">Text Reminders</option>
          <option value="insurance">Insurance</option>
          <option value="patientApp">Patient App</option>
          <option value="editSchedule">Edit Schedule</option>
        </select>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
        <select name="title" value={formData.title} onChange={handleChange}>
          <option value="">Select Title</option>
          <option value="Dr.">Dr.</option>
          <option value="Mr.">Mr.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Ms.">Ms.</option>
          <option value="Prof.">Prof.</option>
          <option value="Miss">Miss</option>
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address.street"
          placeholder="Street"
          value={formData.address.street}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address.city"
          placeholder="City"
          value={formData.address.city}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address.state"
          placeholder="State"
          value={formData.address.state}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address.zip"
          placeholder="ZIP"
          value={formData.address.zip}
          onChange={handleChange}
        />
        <button type="submit">Register</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

const RegistrationModal = ({ open, onClose, branches }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register New User</DialogTitle>
      <DialogContent>
        <RegistrationForm branches={branches} onClose={onClose} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationModal;
