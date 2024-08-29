import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await axios.get("http://localhost:8000/logout", {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.status == 200) {
        setIsAuthenticated(false);
        console.log("logging out");
        navigate("/"); // Redirect to the login page.
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
};

export default Logout;
