import React, { useState } from "react";
import { Modal, Button, TextField, Box } from "@mui/material";

function CPTCodeRegistrationModal({ open, onClose, executeQuery }) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    await executeQuery(
      `
      INSERT INTO cpt_codes (code, description, price)
      VALUES ('${code}', '${description}', ${price})
    `,
      [],
      "cpt_codes"
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 3, maxWidth: 400, margin: "auto", mt: "10%" }}>
        <h2>Add New CPT Code</h2>
        <TextField
          label="CPT Code"
          variant="outlined"
          fullWidth
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Price"
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

export default CPTCodeRegistrationModal;
