import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const EditBranchForm = ({ branch, onClose, executeQuery }) => {
  const [formData, setFormData] = useState({
    branch_name: "",
    address: { zip: "", city: "", state: "", street: "" },
    phone: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        branch_name: branch.branch_name || "",
        address: branch.address || { zip: "", city: "", state: "", street: "" },
        phone: branch.phone || "",
        email: branch.email || "",
        description: branch.description || "",
      });
    }
  }, [branch]);

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
    const { branch_name, address, phone, email, description } = formData;

    // Properly escape single quotes for SQL query
    const escapedBranchName = branch_name.replace(/'/g, "''");
    const escapedPhone = phone.replace(/'/g, "''");
    const escapedEmail = email.replace(/'/g, "''");
    const escapedDescription = description.replace(/'/g, "''");

    // Prepare the JSONB object with escaped values
    const escapedAddress = JSON.stringify(address).replace(/"/g, '""'); // Escape double quotes for SQL

    // Construct the SQL query using jsonb_set
    const query = `
      UPDATE branches
      SET 
        branch_name = '${escapedBranchName}', 
        address = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(address, '{street}', '"${address.street.replace(
                /'/g,
                "''"
              )}"'),
              '{city}', '"${address.city.replace(/'/g, "''")}"'
            ),
            '{state}', '"${address.state.replace(/'/g, "''")}"'
          ),
          '{zip}', '"${address.zip.replace(/'/g, "''")}"'
        ),
        phone = '${escapedPhone}', 
        email = '${escapedEmail}', 
        description = '${escapedDescription}'
      WHERE branch_id = ${branch.branch_id};
    `;

    executeQuery(query, [], "branches");
    onClose();
  };

  const handleDelete = () => {
    const query = `DELETE FROM branches WHERE branch_id = ${branch.branch_id};`;
    executeQuery(query);
    onClose();
  };

  return (
    <div>
      <h1>Edit Branch</h1>
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
            Save
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};

const EditBranchModal = ({ open, onClose, branch, executeQuery }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Branch</DialogTitle>
      <DialogContent>
        <EditBranchForm
          branch={branch}
          onClose={onClose}
          executeQuery={executeQuery}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBranchModal;
