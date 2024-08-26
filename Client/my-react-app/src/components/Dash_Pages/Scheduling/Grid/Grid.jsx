import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AppointmentQueue from "./AppointmentQueue/AppointmentQueue";
import VerticalTabs from "./VerticalTabs/VerticalTabs";

function MyGrid({
  selectedDate,
  setSelectedDate,
  users,
  soaps,
  userinfo,
  appointments,
  patients,
  executeQuery,
}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <AppointmentQueue
            users={users}
            userinfo={userinfo}
            appointments={appointments}
            selectedDate={selectedDate}
            patients={patients}
          />
        </Grid>
        <Grid item xs={10}>
          <VerticalTabs
            appointments={appointments}
            setSelectedDate={setSelectedDate}
            selectedDate={selectedDate}
            users={users}
            userinfo={userinfo}
            patients={patients}
            soaps={soaps}
            executeQuery={executeQuery}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MyGrid;
