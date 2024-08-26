import FlowGrid from "./FlowGrid/FlowGrid";

function FlowView({
  patients,
  userinfo,
  users,
  soaps,
  selectedDate,
  setSelectedDate,
  appointments,
  executeQuery,
}) {
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        style={{ marginBottom: "20px" }}
      />
      <FlowGrid
        executeQuery={executeQuery}
        selectedDate={selectedDate}
        appointments={appointments}
        soaps={soaps}
        patients={patients}
        userinfo={userinfo}
        users={users}
      />
    </div>
  );
}

export default FlowView;
