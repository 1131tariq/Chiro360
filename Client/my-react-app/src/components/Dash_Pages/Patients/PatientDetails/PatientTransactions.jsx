import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

export default function PatientTransactions({ patient, paidAppointments }) {
  const totalBilled = paidAppointments.reduce(
    (total, appointment) => total + parseFloat(appointment.amount || 0),
    0
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Patient Transactions</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Billed: ${totalBilled.toFixed(2)}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Case Type</TableCell>
            <TableCell>Appointment Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paidAppointments.map((appointment, index) => (
            <TableRow key={index}>
              <TableCell>{appointment.case_type}</TableCell>
              <TableCell>
                {new Date(appointment.appointment_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{appointment.amount}</TableCell>
              <TableCell>{appointment.invoice_status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
