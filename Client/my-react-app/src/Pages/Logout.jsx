import React, { useEffect } from 'react';

const Logout = ({setIsAuthenticated}) => {

  useEffect(() => {
    // Update authentication state
    setIsAuthenticated(false);

    // Redirect to the backend URL or any other URL
    window.location.href = "http://localhost:8000/logout";

  }, []);

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  );
};

export default Logout;
