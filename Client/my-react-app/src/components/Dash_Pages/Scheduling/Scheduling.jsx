import MyGrid from "./Grid/Grid";
import * as React from "react";

function Scheduling({
  selectedDate,
  setSelectedDate,
  soaps = [],
  patients = [],
  userinfo = {},
  appointments = [],
  users = [],
  executeQuery = () => {},
}) {
  return (
    <div>
      <MyGrid
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        soaps={soaps}
        patients={patients}
        userinfo={userinfo}
        appointments={appointments}
        users={users}
        executeQuery={executeQuery}
      />
    </div>
  );
}

export default Scheduling;
