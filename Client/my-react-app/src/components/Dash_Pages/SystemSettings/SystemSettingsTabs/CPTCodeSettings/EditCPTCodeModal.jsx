import React, { useState } from "react";
import { Modal, Button, TextField, Box } from "@mui/material";

function EditCPTCodeModal({ open, onClose, cptCode, executeQuery }) {
  const [description, setDescription] = useState(cptCode.description);
  const [price, setPrice] = useState(cptCode.price);

  const handleSubmit = async () => {
    await executeQuery(
      `
      UPDATE cpt_codes
      SET description = '${description}', price = ${price}
      WHERE code = '${cptCode.code}'
    `,
      [],
      "cpt_codes"
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 3, maxWidth: 400, margin: "auto", mt: "10%" }}>
        <h2>Edit CPT Code</h2>
        <TextField
          label="CPT Code"
          variant="outlined"
          fullWidth
          margin="normal"
          value={cptCode.code}
          disabled
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
          Update
        </Button>
      </Box>
    </Modal>
  );
}

export default EditCPTCodeModal;
