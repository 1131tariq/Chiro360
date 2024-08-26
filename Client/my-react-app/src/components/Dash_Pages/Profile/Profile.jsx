import React, { useState } from "react";
import axios from "axios";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";

function Profile({ executeQuery, userInfo }) {
  const [formData, setFormData] = useState({
    username: userInfo.username || "",
    email: userInfo.email || "",
    firstname: userInfo.firstname || "",
    lastname: userInfo.lastname || "",
    phone: userInfo.contactinfo?.phone || "",
    address_street: userInfo.contactinfo?.address.street || "",
    address_city: userInfo.contactinfo?.address.city || "",
    address_state: userInfo.contactinfo?.address.state || "",
    address_zip: userInfo.contactinfo?.address.zip || "",
    title: userInfo.title || "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {
        email,
        firstname,
        lastname,
        phone,
        address_street,
        address_city,
        address_state,
        address_zip,
        title,
      } = formData;

      const contactinfo = {
        phone,
        address: {
          street: address_street,
          city: address_city,
          state: address_state,
          zip: address_zip,
        },
      };

      const query = `
        UPDATE users SET 
          email = $1, 
          firstname = $2, 
          lastname = $3, 
          contactinfo = $4, 
          title = $5
        WHERE id = $6
      `;

      const dataType = "users";

      executeQuery(
        query,
        [email, firstname, lastname, contactinfo, title, userInfo.id],
        "users"
      );

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage("Error updating profile.");
      console.error("Error:", error);
    }
  };

  return (
    <Paper style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        User Settings
      </Typography>
      {userInfo ? (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Address</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                name="address_street"
                value={formData.address_street}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="address_city"
                value={formData.address_city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="address_state"
                value={formData.address_state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="address_zip"
                value={formData.address_zip}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Title</InputLabel>
                <Select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Title</MenuItem>
                  <MenuItem value="Mr.">Mr.</MenuItem>
                  <MenuItem value="Mrs.">Mrs.</MenuItem>
                  <MenuItem value="Ms.">Ms.</MenuItem>
                  <MenuItem value="Dr.">Dr.</MenuItem>
                  <MenuItem value="Prof.">Prof.</MenuItem>
                </Select>
                <FormHelperText>Select your title</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1">
                Permission Level: {userInfo.permission_level}
              </Typography>
              <Typography variant="body1">
                User Kind: {userInfo.user_kind}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </Grid>
          </Grid>
          {message && (
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ marginTop: "20px" }}
            >
              {message}
            </Typography>
          )}
        </form>
      ) : (
        <Typography>Loading user information...</Typography>
      )}
    </Paper>
  );
}

export default Profile;
