import React, { useState, useMemo } from "react";
import {
  Grid,
  Paper,
  MenuItem,
  Select,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { PieChart, BarChart } from "@mui/x-charts";

function Analytics({ appointments, soaps, patients, users }) {
  const [dateRange, setDateRange] = useState("Last Year");

  const filterAppointmentsByDateRange = (appointments, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "Last Week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "Last Month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "Last 3 Months":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "Last Year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      startDate = startDate.toISOString().split("T")[0];
    }

    return appointments.filter((appointment) => {
      const appointmentDate = appointment.appointment_date.split("T")[0];
      return (
        (!startDate || appointmentDate >= startDate) &&
        new Date(appointment.appointment_date) <= now
      );
    });
  };

  const getRevenueData = (appointments, range) => {
    const filteredAppointments = filterAppointmentsByDateRange(
      appointments,
      range
    );

    const revenueData = {};
    filteredAppointments.forEach((appointment) => {
      const date = new Date(appointment.appointment_date);
      const key =
        range === "Last Year"
          ? date.getMonth()
          : date.toISOString().split("T")[0];

      if (!revenueData[key]) {
        revenueData[key] = 0;
      }
      revenueData[key] += parseFloat(appointment.amount);
    });

    const sortedData = Object.entries(revenueData)
      .map(([key, amount]) => ({
        date:
          range === "Last Year"
            ? new Date(2021, parseInt(key)).toLocaleString("default", {
                month: "short",
              })
            : key,
        amount,
        monthIndex:
          range === "Last Year" ? parseInt(key) : new Date(key).getTime(),
      }))
      .sort((a, b) => a.monthIndex - b.monthIndex);

    return sortedData.map(({ date, amount }) => ({ date, amount }));
  };

  const getRevenuePerBranchData = (appointments, range) => {
    const filteredAppointments = filterAppointmentsByDateRange(
      appointments,
      range
    );

    const revenueByBranch = filteredAppointments.reduce((acc, appointment) => {
      const branchId = appointment.branch_id;
      if (!acc[branchId]) {
        acc[branchId] = 0;
      }
      acc[branchId] += parseFloat(appointment.amount);
      return acc;
    }, {});

    return Object.entries(revenueByBranch).map(([branchId, revenue]) => ({
      label: `Branch ${branchId}`,
      value: revenue,
    }));
  };

  const getSOAPStatusDistribution = (soaps) => {
    const statusCounts = soaps.reduce((acc, soap) => {
      acc[soap.status] = (acc[soap.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      label: status,
      value: count,
    }));
  };

  const getTopTreatments = (appointments) => {
    const typeCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.appointment_type] =
        (acc[appointment.appointment_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      label: type,
      value: count,
    }));
  };

  const getTopPatients = (appointments, patients) => {
    const paidAppointments = appointments.filter(
      (appointment) => appointment.invoice_status === "Paid"
    );

    const patientBilling = paidAppointments.reduce((acc, appointment) => {
      const patient = patients.find(
        (p) => p.patientid === appointment.patient_id
      );
      if (!patient) return acc;
      const name = `${patient.firstname} ${patient.lastname}`;
      acc[name] = (acc[name] || 0) + (Number(appointment.amount) || 0);
      return acc;
    }, {});

    const sortedPatients = Object.entries(patientBilling)
      .map(([name, totalBilling]) => ({
        name,
        totalBilling: Number(totalBilling),
      }))
      .sort((a, b) => b.totalBilling - a.totalBilling)
      .slice(0, 10);

    return sortedPatients;
  };

  const getRevenuePerProviderData = (appointments, range) => {
    const filteredAppointments = filterAppointmentsByDateRange(
      appointments,
      range
    );

    const revenueByProvider = filteredAppointments.reduce(
      (acc, appointment) => {
        const providerId = appointment.provider_id;
        if (!acc[providerId]) {
          acc[providerId] = 0;
        }
        acc[providerId] += parseFloat(appointment.amount);
        return acc;
      },
      {}
    );

    const providerNames = users.reduce((acc, user) => {
      acc[user.id] = `${user.firstname} ${user.lastname}`;
      return acc;
    }, {});

    // Map provider IDs to names using the `providerNames` lookup
    return Object.entries(revenueByProvider).map(([providerId, revenue]) => ({
      label: providerNames[providerId],
      value: revenue,
    }));
  };

  const revenueData = useMemo(
    () => getRevenueData(appointments, dateRange),
    [appointments, dateRange]
  );

  const formattedRevenuePerProviderData = useMemo(
    () => getRevenuePerProviderData(appointments, dateRange),
    [appointments, dateRange, users]
  );
  const soapStatusData = getSOAPStatusDistribution(soaps);
  const topTreatmentsData = getTopTreatments(appointments);
  const topPatientsData = getTopPatients(appointments, patients);
  const revenuePerBranchData = getRevenuePerBranchData(appointments, dateRange);
  const monthlyChartData = {
    series: [
      {
        data: revenueData.map((item) => item.amount),
      },
    ],
    xAxis: [
      {
        data: revenueData.map((item) => item.date),
        scaleType: "band",
      },
    ],
  };

  return (
    <Grid container spacing={3}>
      {/* Billing Bar Chart */}
      <Grid item xs={12}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Billing Data
          </Typography>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ marginBottom: "1rem", width: "100%" }}
          >
            <MenuItem value="Last Week">Last Week</MenuItem>
            <MenuItem value="Last Month">Last Month</MenuItem>
            <MenuItem value="Last 3 Months">Last 3 Months</MenuItem>
            <MenuItem value="Last Year">Last Year</MenuItem>
          </Select>
          <BarChart
            series={monthlyChartData.series}
            xAxis={monthlyChartData.xAxis}
            height={400}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
          />
        </Paper>
      </Grid>

      {/* SOAP Status Pie Chart */}
      <Grid item xs={6}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            SOAP Status Distribution
          </Typography>
          <PieChart
            series={[{ data: soapStatusData }]}
            width={400}
            height={300}
            legends={{
              position: "bottom",
              align: "center",
              itemStyle: {
                fontSize: "14px",
              },
              itemGap: 10,
            }}
            labels={{
              show: true,
              formatter: (item) => `${item.name}: $${item.value.toFixed(2)}`,
            }}
          />
        </Paper>
      </Grid>

      {/* Top Treatments Pie Chart */}
      <Grid item xs={6}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Top Treatments
          </Typography>
          <PieChart
            series={[{ data: topTreatmentsData }]}
            width={400}
            height={300}
            legends={{
              position: "bottom",
              align: "center",
              itemStyle: {
                fontSize: "14px",
              },
              itemGap: 10,
            }}
            labels={{
              show: true,
              formatter: (item) => `${item.name}: ${item.value}`,
            }}
          />
        </Paper>
      </Grid>

      {/* Revenue by Branch Pie Chart */}
      <Grid item xs={6}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Revenue by Branch
          </Typography>
          <PieChart
            series={[{ data: revenuePerBranchData }]}
            width={400}
            height={300}
            legends={{
              position: "bottom",
              align: "center",
              itemStyle: {
                fontSize: "110px",
              },
              itemGap: 10,
            }}
            labels={{
              show: true,
              formatter: (item) => `${item.name}: $${item.value.toFixed(2)}`,
            }}
          />
        </Paper>
      </Grid>

      {/* Revenue by Provider Pie Chart */}
      <Grid item xs={6}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Revenue by Provider
          </Typography>
          <PieChart
            series={[{ data: formattedRevenuePerProviderData }]}
            width={400}
            height={300}
            legends={{
              position: "bottom",
              align: "center",
              itemStyle: {
                fontSize: "14px",
              },
              itemGap: 10,
            }}
            labels={{
              show: true,
              formatter: (item) => `${item.name}: $${item.value.toFixed(2)}`,
            }}
          />
        </Paper>
      </Grid>

      {/* Top Patients Table */}
      <Grid item xs={12}>
        <Paper style={{ padding: "16px" }}>
          <Typography variant="h6" align="center" gutterBottom>
            Top Patients by Billing
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell align="right">Total Billing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPatientsData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">
                      ${row.totalBilling.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Analytics;
