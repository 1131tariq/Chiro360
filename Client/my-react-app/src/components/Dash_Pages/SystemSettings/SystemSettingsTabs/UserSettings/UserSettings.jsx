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
import RegistrationModal from "./RegistrationForm/RegistrationForm";
import EditUserModal from "./EditUserModal/EditUserModal";

function UserSettings({ executeQuery, users, branches }) {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        `${user.firstname} ${user.lastname} ${user.email} ${user.permission_level} ${user.branch_id} ${user.username}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const handleOpenRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <h1>Users</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenRegistrationModal}
      >
        Register New User
      </Button>
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
              <TableCell>Username</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>User Kind</TableCell>
              <TableCell>Permission Level</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_kind}</TableCell>
                  <TableCell>{user.permission_level}</TableCell>
                  <TableCell>{user.branch_id}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenEditModal(user)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>Loading Users...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <RegistrationModal
        branches={branches}
        open={isRegistrationModalOpen}
        onClose={handleCloseRegistrationModal}
      />
      {selectedUser && (
        <EditUserModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={selectedUser}
          branches={branches}
          executeQuery={executeQuery}
        />
      )}
    </div>
  );
}

export default UserSettings;
