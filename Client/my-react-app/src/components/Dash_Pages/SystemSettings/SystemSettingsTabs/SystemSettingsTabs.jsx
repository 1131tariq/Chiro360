import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import UserSettings from "./UserSettings/UserSettings";
import BranchSettings from "./BranchSettings/BranchSettings";
import CPTCodeSettings from "./CPTCodeSettings/CPTCodeSettings";

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

export default function SystemSettingsTabs({
  cptCodes,
  executeQuery,
  branches,
  users,
}) {
  const [value, setValue] = React.useState(0);

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
          <Tab label="Users" {...a11yProps(0)} />
          <Tab label="Branches" {...a11yProps(1)} />
          <Tab label="CPT Codes" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <UserSettings
          executeQuery={executeQuery}
          branches={branches}
          users={users}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <BranchSettings executeQuery={executeQuery} branches={branches} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <CPTCodeSettings executeQuery={executeQuery} cptCodes={cptCodes} />
      </CustomTabPanel>
    </Box>
  );
}
