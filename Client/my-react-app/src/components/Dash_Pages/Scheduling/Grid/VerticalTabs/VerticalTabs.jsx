import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import CalendarView from "./CalendarView/CalendarView";
import FlowView from "./FlowView/FlowView";

function VerticalTabs({
  patients,
  userinfo,
  users,
  soaps,
  setSelectedDate,
  selectedDate,
  appointments,
  executeQuery,
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

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        height: 224,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
      >
        <Tab label="Calendar" {...a11yProps(0)} />
        <Tab label="Flow" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <CalendarView
          userinfo={userinfo}
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          soaps={soaps}
          users={users}
          appointments={appointments}
          executeQuery={executeQuery}
          patients={patients}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <FlowView
          executeQuery={executeQuery}
          patients={patients}
          users={users}
          soaps={soaps}
          userinfo={userinfo}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          appointments={appointments}
        />
      </TabPanel>
    </Box>
  );
}

export default VerticalTabs;
