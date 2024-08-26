import React, { useEffect, useState } from "react";
import axios from "axios";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login"; // Import the Login component
import Dashboard from "./Dashboard"; // Import the Login component
import Logout from "./Logout"; // Import the Login component

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:8000/auth/status", {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
        setUserInfo(response.data.user);
      } else {
        setIsAuthenticated(false);
        navigate("login");
      }
    } catch (error) {
      console.log("Error fetching auth status:", error);
      setIsAuthenticated(false);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Login setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Dashboard
              checkAuthStatus={checkAuthStatus}
              userInfo={userInfo}
              setIsAuthenticated={setIsAuthenticated}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/logout"
        element={<Logout setIsAuthenticated={setIsAuthenticated} />}
      />{" "}
    </Routes>
  );
};

export default App;
