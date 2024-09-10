import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const EditUserForm = ({ user, branches, onClose, executeQuery }) => {
  const [formData, setFormData] = useState({
    user_kind: "",
    permission_level: "",
    branch: "",
    username: "",
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
    title: "",
  });

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // State for confirmation dialog

  useEffect(() => {
    if (user) {
      setFormData({
        user_kind: user.user_kind || "",
        permission_level: user.permission_level || "",
        branch: user.branch_id || "",
        username: user.username || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.contactinfo.phone || "",
        address: user.contactinfo.address || {
          street: "",
          city: "",
          state: "",
          zip: "",
        },
        permissions: user.permissions || [],
        title: user.title || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
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
      const selectedValues = Array.from(
        selectedOptions,
        (option) => option.value
      );
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedValues,
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
    console.log("DDDDD " + formData.permission_level);
    // Format the arrays correctly for SQL
    const formattedPermissions = `{${formData.permissions
      .map((permission) => `"${permission}"`)
      .join(",")}}`;

    executeQuery(
      `
        UPDATE users 
        SET 
          firstname = '${formData.firstname}', 
          lastname = '${formData.lastname}', 
          email = '${formData.email}', 
          contactinfo = jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(contactinfo, '{phone}', '"${formData.phone}"', true),
                  '{address,street}', '"${formData.address.street}"', true
                ),
                '{address,city}', '"${formData.address.city}"', true
              ),
              '{address,state}', '"${formData.address.state}"', true
            ),
            '{address,zip}', '"${formData.address.zip}"', true
          ),
          branch_id = '${formData.branch}',
          user_kind = '${formData.user_kind}',
          permission_level = '${formData.permission_level}',
          username = '${formData.username}',
          permissions = '${formattedPermissions}',
          title = '${formData.title}'
        WHERE id = ${user.id}`,
      [],
      "users"
    );
    console.log("User updated successfully");
    onClose();
  };

  const handleDelete = () => {
    setOpenConfirmDialog(true); // Open confirmation dialog
  };

  const confirmDelete = async () => {
    executeQuery(`DELETE FROM users WHERE id = $1`, [user.id], "users");
    console.log("User deleted successfully");
    onClose();
  };

  const cancelDelete = () => {
    setOpenConfirmDialog(false); // Close confirmation dialog
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <select
          name="user_kind"
          value={formData.user_kind}
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
          name="permission_level"
          value={formData.permission_level}
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

        <TextField
          margin="dense"
          name="username"
          label="Username"
          type="text"
          fullWidth
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="firstname"
          label="First Name"
          type="text"
          fullWidth
          value={formData.firstname}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="lastname"
          label="Last Name"
          type="text"
          fullWidth
          value={formData.lastname}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="phone"
          label="Phone"
          type="text"
          fullWidth
          value={formData.phone}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="address.street"
          label="Street"
          type="text"
          fullWidth
          value={formData.address.street}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="address.city"
          label="City"
          type="text"
          fullWidth
          value={formData.address.city}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="address.state"
          label="State"
          type="text"
          fullWidth
          value={formData.address.state}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="address.zip"
          label="ZIP"
          type="text"
          fullWidth
          value={formData.address.zip}
          onChange={handleChange}
        />
        <select name="title" value={formData.title} onChange={handleChange}>
          <option value="">Select Title</option>
          <option value="Dr.">Dr.</option>
          <option value="Mr.">Mr.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Ms.">Ms.</option>
          <option value="Prof.">Prof.</option>
          <option value="Miss">Miss</option>
          {/* Add more options as needed */}
        </select>

        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Submit
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </form>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={cancelDelete}
        aria-labelledby="confirmation-dialog-title"
      >
        <DialogTitle id="confirmation-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const EditUserModal = ({ open, onClose, user, branches, executeQuery }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <EditUserForm
          user={user}
          branches={branches}
          onClose={onClose}
          executeQuery={executeQuery}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
