import React, { useState } from "react";
import {
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import NewPatientModal from "./NewPatientModal/NewPatientModal";

function PatientSearch({
  userinfo,
  users,
  executeQuery,
  patients,
  setSelectedPatient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (patient) => {
    setSelectedPatient(patient);
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstname} ${patient.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleNewPatientSave = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}
      >
        <TextField
          variant="outlined"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
        />
        {userinfo.user_kind !== "Call Agent" && (
          <Button
            variant="contained"
            color="primary"
            style={{
              marginLeft: "16px",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              minWidth: "40px",
              padding: "0",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            +
          </Button>
        )}
      </div>
      <div
        className="card-container"
        style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}
      >
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card
              key={patient.patientid}
              onClick={() => handleCardClick(patient)}
              style={{ cursor: "pointer", maxWidth: "300px" }}
            >
              <CardContent>
                <Typography variant="h6">
                  {patient.firstname} {patient.lastname}
                </Typography>
                <Typography variant="body2">
                  Date of Birth: {patient.dateofbirth || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Gender: {patient.gender || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Phone: {patient.contactinfo?.phone || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No patients found</Typography>
        )}
      </div>

      <NewPatientModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNewPatientSave}
        executeQuery={executeQuery}
        users={users}
      />
    </div>
  );
}

export default PatientSearch;
