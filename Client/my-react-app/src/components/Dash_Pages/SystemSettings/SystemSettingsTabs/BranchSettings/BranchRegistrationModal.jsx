import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const BranchRegistrationForm = ({ onClose, executeQuery }) => {
  const [formData, setFormData] = useState({
    branch_name: "",
    address: { zip: "", city: "", state: "", street: "" },
    phone: "",
    email: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const addressStr = JSON.stringify(formData.address);
    const query = `
      INSERT INTO branches (branch_name, address, phone, email, description)
      VALUES ('${formData.branch_name}', '${addressStr}', '${formData.phone}', '${formData.email}', '${formData.description}');
    `;
    executeQuery(query, [], "branches");
    onClose();
  };

  return (
    <div>
      <h1>Register New Branch</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          margin="dense"
          name="branch_name"
          label="Branch Name"
          type="text"
          fullWidth
          value={formData.branch_name}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="address.street"
          label="Street"
          type="text"
          fullWidth
          value={formData.address.street}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="address.city"
          label="City"
          type="text"
          fullWidth
          value={formData.address.city}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="address.state"
          label="State"
          type="text"
          fullWidth
          value={formData.address.state}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="address.zip"
          label="Zip Code"
          type="text"
          fullWidth
          value={formData.address.zip}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="phone"
          label="Phone"
          type="text"
          fullWidth
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          value={formData.description}
          onChange={handleChange}
        />
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Submit
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};

const BranchRegistrationModal = ({ open, onClose, executeQuery }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register New Branch</DialogTitle>
      <DialogContent>
        <BranchRegistrationForm onClose={onClose} executeQuery={executeQuery} />
      </DialogContent>
    </Dialog>
  );
};

export default BranchRegistrationModal;
