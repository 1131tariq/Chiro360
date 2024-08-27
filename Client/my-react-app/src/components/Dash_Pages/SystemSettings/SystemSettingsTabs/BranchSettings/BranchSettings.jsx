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
import BranchRegistrationModal from "./BranchRegistrationModal";
import EditBranchModal from "./EditBranchModal";

function BranchSettings({ userinfo, executeQuery, branches }) {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBranches, setFilteredBranches] = useState(branches);

  useEffect(() => {
    setFilteredBranches(
      branches.filter((branch) =>
        `${branch.branch_name} ${branch.address.street} ${branch.address.city} ${branch.address.state} ${branch.address.zip} ${branch.phone} ${branch.email} ${branch.description}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, branches]);

  const handleOpenRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  const handleOpenEditModal = (branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBranch(null);
  };

  return (
    <div>
      <h1>Branches</h1>
      {userinfo.permission_level == "System Admin" && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenRegistrationModal}
        >
          Add New Branch
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
              <TableCell>Branch ID</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <TableRow key={branch.branch_id}>
                  <TableCell>{branch.branch_id}</TableCell>
                  <TableCell>{branch.branch_name}</TableCell>
                  <TableCell>
                    {`${branch.address.street}, ${branch.address.city}, ${branch.address.state} ${branch.address.zip}`}
                  </TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell>{branch.email}</TableCell>
                  <TableCell>{branch.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenEditModal(branch)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>No branches found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <BranchRegistrationModal
        open={isRegistrationModalOpen}
        onClose={handleCloseRegistrationModal}
        executeQuery={executeQuery}
      />
      {selectedBranch && (
        <EditBranchModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          branch={selectedBranch}
          executeQuery={executeQuery}
        />
      )}
    </div>
  );
}

export default BranchSettings;
