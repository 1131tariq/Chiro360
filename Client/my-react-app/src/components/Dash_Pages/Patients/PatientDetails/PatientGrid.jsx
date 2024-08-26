import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PatientCases from "./PatientCases";
import PatientDemongraphicsForm from "./PatientDemongraphicsForm";
import PatientFutureVisits from "./PatientFutureVisits";
import PatientScheduling from "./PatientScheduling";
import PatientTransactions from "./PatientTransactions";
import PatientVisits from "./PatientVisits";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function filterAppointments(appointments) {
  const now = new Date();

  const paidAppointments = appointments.filter(
    (appointment) => appointment.invoice_status === "Paid"
  );

  const attendedAppointments = appointments.filter(
    (appointment) =>
      new Date(appointment.appointment_date) < now &&
      appointment.status !== "Scheduled" &&
      appointment.status !== "Cancelled"
  );

  const futureAppointments = appointments.filter(
    (appointment) =>
      new Date(appointment.appointment_date) >= now &&
      appointment.status !== "Completed"
  );

  return { paidAppointments, attendedAppointments, futureAppointments };
}

export default function PatientGrid({
  users,
  userinfo,
  executeQuery,
  soaps,
  patient,
  appointments,
}) {
  const [value, setValue] = React.useState(0);

  const { paidAppointments, attendedAppointments, futureAppointments } =
    filterAppointments(appointments);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Patient" {...a11yProps(0)} />
          <Tab label="Cases" {...a11yProps(1)} />
          <Tab label="Treatment Plans" {...a11yProps(2)} />
          <Tab label="Transactions" {...a11yProps(3)} />
          <Tab label="Visits" {...a11yProps(4)} />
          <Tab label="Future Appointments" {...a11yProps(5)} />
          <Tab label="Scheduling" {...a11yProps(6)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {/* Holds a form to change the patients demographic information */}
        <PatientDemongraphicsForm
          executeQuery={executeQuery}
          patient={patient}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {/* Holds a table of all the patients cases and their balance on each, example cash or insurance case */}
        <PatientCases patient={patient} appointments={appointments} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {/* Show all treatment plans for the patient which can be clickable and will
        display more information on the plan. and basically a plan is a
        collection of appointments for that patient with a common value for the
        column called treatment_plan */}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        {/* Table of all the patients transactions and their dates and you can filter what's paid and what's not paid and case etc */}
        <PatientTransactions
          patient={patient}
          paidAppointments={paidAppointments}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        {/* Record of all appointments attended by the patient that when clicked will show that appointment's details and any associated SOAP notes */}
        <PatientVisits
          patient={patient}
          executeQuery={executeQuery}
          soaps={soaps}
          attendedAppointments={attendedAppointments}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        {/* Record of all upcoming appointments */}
        <PatientFutureVisits
          patient={patient}
          executeQuery={executeQuery}
          users={users}
          futureAppointments={futureAppointments}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={6}>
        {/* Module to schedule appointments for that patient with functionality to be recurring */}
        <PatientScheduling
          userinfo={userinfo}
          users={users}
          appointments={appointments}
          patient={patient}
          executeQuery={executeQuery}
        />
      </CustomTabPanel>
    </Box>
  );
}
