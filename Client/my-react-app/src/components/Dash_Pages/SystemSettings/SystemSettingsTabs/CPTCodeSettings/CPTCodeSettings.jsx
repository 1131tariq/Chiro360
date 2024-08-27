import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import CPTCodeRegistrationModal from "./CPTCodeRegistrationModal";
import EditCPTCodeModal from "./EditCPTCodeModal";

function CPTCodeSettings({ userinfo, executeQuery, cptCodes }) {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCPTCode, setSelectedCPTCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCPTCodes, setFilteredCPTCodes] = useState(cptCodes || []);

  useEffect(() => {
    setFilteredCPTCodes(
      (cptCodes || []).filter((code) =>
        `${code.code} ${code.description}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, cptCodes]);

  const handleOpenRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  const handleOpenEditModal = (code) => {
    setSelectedCPTCode(code);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCPTCode(null);
  };

  return (
    <div>
      <h1>CPT Codes</h1>
      {userinfo.permission_level == "System Admin" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenRegistrationModal}
        >
          Add New CPT Code
        </Button>
      )}
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CPT Code</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              {userinfo.permission_level == "System Admin" && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCPTCodes.length > 0 ? (
              filteredCPTCodes.map((code) => {
                // Ensure price is a number and has a valid value
                const price = Number(code.price) || 0;
                return (
                  <TableRow key={code.id}>
                    <TableCell>{code.code}</TableCell>
                    <TableCell>{code.description}</TableCell>
                    <TableCell>{`$${price.toFixed(2)}`}</TableCell>
                    <TableCell>
                      {userinfo.permission_level == "System Admin" && (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenEditModal(code)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No CPT Codes found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <CPTCodeRegistrationModal
        open={isRegistrationModalOpen}
        onClose={handleCloseRegistrationModal}
        executeQuery={executeQuery}
      />
      {selectedCPTCode && (
        <EditCPTCodeModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          cptCode={selectedCPTCode}
          executeQuery={executeQuery}
        />
      )}
    </div>
  );
}

export default CPTCodeSettings;
