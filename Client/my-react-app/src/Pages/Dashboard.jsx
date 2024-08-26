import React, { useEffect, useState } from "react";
import axios from "axios";
import Profile from "../components/Dash_Pages/Profile/Profile";
import Inventory from "../components/Dash_Pages/Inventory/Inventory";
import Marketing from "../components/Dash_Pages/Marketing/Marketing";
import Billing from "../components/Dash_Pages/Billing/Billing";
import Analytics from "../components/Dash_Pages/Analytics/Analytics";
import Patients from "../components/Dash_Pages/Patients/Patients";
import ProviderSOAP from "../components/Dash_Pages/SOAP/ProviderSOAP/ProviderSOAP";
import Scheduling from "../components/Dash_Pages/Scheduling/Scheduling";
import Logout from "./Logout";
import ResponsiveAppBar from "../components/Dash_Pages/ResponsiveAppBar/ResponsiveAppBar";
import SystemSettings from "../components/Dash_Pages/SystemSettings/SystemSettings";

const Dashboard = ({ userInfo, checkAuthStatus, setIsAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [cptCodes, setCPTcodes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [soaps, setSoaps] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [currentView, setCurrentView] = useState("scheduling");
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    checkAuthStatus();

    // Fetch initial data
    executeQuery("SELECT * FROM users", [], "users");
    executeQuery("SELECT * FROM patients", [], "patients");
    executeQuery("SELECT * FROM appointments", [], "appointments");
    executeQuery("SELECT * FROM branches", [], "branches");
    executeQuery("SELECT * FROM soaps", [], "soaps");
    executeQuery("SELECT * FROM cpt_codes", [], "cpt_codes");
    executeQuery("SELECT * FROM inventory", [], "inventory");

    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = async (event) => {
      try {
        const messageData =
          typeof event.data === "string" ? event.data : await event.data.text();
        const parsedMessage = JSON.parse(messageData);

        if (parsedMessage && parsedMessage.type) {
          handleWebSocketMessage(parsedMessage);
        } else {
          console.warn("Unknown message format:", parsedMessage);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const executeQuery = async (query, params, dataType) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/execute-query",
        { query, params, dataType },
        { withCredentials: true }
      );

      if (response.status === 200) {
        switch (dataType) {
          case "users":
            setUsers(response.data);
            break;
          case "patients":
            setPatients(response.data);
            break;
          case "appointments":
            setAppointments(response.data);
            break;
          case "branches":
            setBranches(response.data);
            break;
          case "soaps":
            setSoaps(response.data);
            break;
          case "inventory":
            setInventory(response.data);
            break;
          case "cpt_codes":
            setCPTcodes(response.data);
            break;
          default:
            console.warn("Unknown data type:", dataType);
        }
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case "users":
        setUsers(message.data);
        break;
      case "patients":
        setPatients(message.data);
        break;
      case "branches":
        setBranches(message.data);
        break;
      case "appointments":
        setAppointments(message.data);
        break;
      case "soaps":
        setSoaps(message.data);
        break;
      case "inventory":
        setInventory(message.data);
        break;
      case "cpt_codes":
        setCPTcodes(message.data);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "schedule":
        return (
          <Scheduling
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            patients={patients}
            userinfo={userInfo}
            users={users}
            appointments={appointments}
            executeQuery={executeQuery}
            soaps={soaps}
          />
        );
      case "patients":
        return (
          <Patients
            userinfo={userInfo}
            soaps={soaps}
            users={users}
            executeQuery={executeQuery}
            patients={patients}
            appointments={appointments}
          />
        );
      case "soap":
        return (
          <ProviderSOAP
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            patients={patients}
            executeQuery={executeQuery}
            userinfo={userInfo}
            users={users}
            appointments={appointments}
            soaps={soaps}
            cptCodes={cptCodes}
          />
        );
      case "billing":
        return (
          <Billing
            executeQuery={executeQuery}
            patients={patients}
            appointments={appointments}
          />
        );
      case "analytics":
        return (
          <Analytics
            appointments={appointments}
            soaps={soaps}
            users={users}
            branches={branches}
            patients={patients}
          />
        );
      case "leads":
        return <Marketing />;
      case "inventory":
        return <Inventory inventory={inventory} />;
      case "profile":
        return (
          <Profile
            executeQuery={executeQuery}
            userInfo={users.find((user) => user.id === userInfo.id)}
          />
        );
      case "logout":
        return <Logout setIsAuthenticated={setIsAuthenticated} />;
      case "system-settings":
        return (
          <SystemSettings
            executeQuery={executeQuery}
            cptCodes={cptCodes}
            branches={branches}
            users={users}
          />
        );
      default:
        return (
          <Scheduling
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            patients={patients}
            userinfo={userInfo}
            users={users}
            appointments={appointments}
            executeQuery={executeQuery}
            soaps={soaps}
          />
        );
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ResponsiveAppBar userInfo={userInfo} setCurrentView={setCurrentView} />

      {renderContent()}
    </div>
  );
};

export default Dashboard;
