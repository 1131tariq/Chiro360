import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import MyCalendar from "./MyCalendar/MyCalendar";

function CalendarView({
  selectedDate,
  setSelectedDate,
  users,
  soaps,
  appointments,
  userinfo,
  executeQuery,
  patients,
}) {
  const [value, setValue] = React.useState(0);

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  // Filter appointments for a specific user or all users
  const filterAppointments = (userId) => {
    if (userId === "all") {
      return appointments.filter(
        (appointment) => appointment.branch_id === userinfo.branch_id
      );
    }
    return appointments.filter(
      (appointment) => appointment.provider_id === userId
    );
  };

  // Filter users based on branchid
  const filteredUsers = users.filter(
    (user) =>
      user.branch_id === userinfo.branch_id &&
      user.user_kind !== "Administrative only"
  );

  // Determine if current user is "Administrative only"
  const isAdministrativeOnly = userinfo.user_kind === "Administrative only";

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {/* Conditionally render "All" tab */}
          {isAdministrativeOnly && <Tab label="All" {...a11yProps(0)} />}

          {/* Conditionally render user tabs based on user type */}
          {isAdministrativeOnly ? (
            filteredUsers.map((user, index) => (
              <Tab
                label={`${user.firstname} ${user.lastname}`}
                {...a11yProps(index + 1)}
                key={user.id}
              />
            ))
          ) : (
            <Tab
              label={`${userinfo.firstname} ${userinfo.lastname}`}
              {...a11yProps(0)}
              key={userinfo.id}
            />
          )}
        </Tabs>
      </Box>

      {/* Conditionally render "All" tab panel */}
      {isAdministrativeOnly && (
        <CustomTabPanel value={value} index={0}>
          <MyCalendar
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            appointments={filterAppointments("all")}
            executeQuery={executeQuery}
            users={users}
            userInfo={userinfo}
            soaps={soaps}
            patients={patients}
          />
        </CustomTabPanel>
      )}

      {/* Conditionally render user tab panels */}
      {isAdministrativeOnly ? (
        filteredUsers.map((user, index) => (
          <CustomTabPanel value={value} index={index + 1} key={user.id}>
            <MyCalendar
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              appointments={filterAppointments(user.id)}
              executeQuery={executeQuery}
              users={users}
              soaps={soaps}
              userInfo={userinfo}
              patients={patients}
            />
          </CustomTabPanel>
        ))
      ) : (
        <CustomTabPanel value={value} index={0}>
          <MyCalendar
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            appointments={filterAppointments(userinfo.id)}
            executeQuery={executeQuery}
            users={users}
            soaps={soaps}
            userInfo={userinfo}
            patients={patients}
          />
        </CustomTabPanel>
      )}
    </div>
  );
}

export default CalendarView;
