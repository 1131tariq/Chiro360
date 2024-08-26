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

export default function PatientCases({ patient, appointments }) {
  // Function to group appointments by case_type and calculate sums
  const aggregateCases = (appointments) => {
    return appointments.reduce((acc, appointment) => {
      const { case_type, amount = 0, invoice_status } = appointment;

      // Safeguard against null or undefined invoice_status
      const isPaid = invoice_status?.toLowerCase() === "paid";

      if (!acc[case_type]) {
        acc[case_type] = { totalAmount: 0, totalPaid: 0, count: 0 };
      }

      // Add to total amount
      acc[case_type].totalAmount += Number(amount) || 0;

      // Add to total paid only if the appointment is paid
      if (isPaid) {
        acc[case_type].totalPaid += Number(amount) || 0;
      }
      acc[case_type].count += 1;

      return acc;
    }, {});
  };

  // Aggregate the cases
  const aggregatedCases = aggregateCases(appointments);

  // Create a sorted array of case types with their sums
  const sortedCaseTypes = Object.keys(aggregatedCases)
    .sort()
    .map((case_type) => ({
      case_type,
      ...aggregatedCases[case_type],
    }));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Patient Cases</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Case Type</TableCell>
            <TableCell>Total Amount</TableCell>
            <TableCell>Total Paid</TableCell>
            <TableCell>Number of Appointments</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCaseTypes.map((caseSummary, index) => (
            <TableRow key={index}>
              <TableCell>{caseSummary.case_type}</TableCell>
              <TableCell>{caseSummary.totalAmount.toFixed(2)}</TableCell>
              <TableCell>{caseSummary.totalPaid.toFixed(2)}</TableCell>
              <TableCell>{caseSummary.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
