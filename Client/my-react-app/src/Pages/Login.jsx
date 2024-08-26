import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/login",
        { username: email, password: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensure cookies are included
        }
      );

      if (response.status === 200) {
        setIsAuthenticated(true);
        navigate("/dashboard"); // Redirect to the dashboard on successful login
      }
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.");
      setIsAuthenticated(false);
      console.error("Login error:", error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{ padding: "20px", marginTop: "50px", borderRadius: "10px" }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Chiro360°
          </Typography>
        </Box>

        <Typography component="h2" variant="h6" align="center" mb={3}>
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" align="center" mb={2}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
