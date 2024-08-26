import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
} from "@mui/material";

const SOAPNote = ({
  soapId,
  subjective,
  objective,
  assessment,
  plan,
  setObjective,
  setStatus,
  setAssessment,
  setPlan,
  patient,
  appointment,
  status,
  executeQuery,
  cptCodes,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Subjective", "Objective", "Assessment", "Plan"];
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [primaryComplaint, setPrimaryComplaint] = useState("");
  const [subjectiveSummary, setSubjectiveSummary] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [selectedReveals, setSelectedReveals] = useState([]);
  const [objectiveSummary, setObjectiveSummary] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [supportiveServices, setSupportiveServices] = useState([]);
  const [additionalCPTs, setAdditionalCPTs] = useState([]);
  const [invoiceStatus, setInvoiceStatus] = useState("Not Issued");
  const [amount, setAmount] = useState(0);
  const displayAmount = Number(amount).toFixed(2);
  const spinalSegments = [
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "C6",
    "C7",
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
    "L1",
    "L2",
    "L3",
    "L4",
    "L5",
    "S1",
    "S2",
    "S3",
    "S4",
    "S5",
    "Coccyx",
  ];
  const services = ["Hydromassage", "None"];
  const discomfortAreas = [
    "Cervical",
    "Thoracic",
    "Lumbar",
    "Sacrum",
    "Left illum",
    "Right illum",
    "Upper Extremity",
    "Left Shoulder",
    "Right Shoulder",
    "Left Elbow",
    "Right Elbow",
    "Left Wrist/Hand",
    "Right Wrist/Hand",
    "Lower Extremity",
    "Left Hip",
    "Right Hip",
    "Left Knee",
    "Right Knee",
    "Left Ankle/Foot",
    "Right Ankle/Foot",
    "Rib",
    "Head",
  ];
  const restrictions = [
    "Cervical",
    "Sacrum",
    "Thoracic",
    "Left illum",
    "Right illum",
    "Lumbar",
  ];
  const reveals = [
    "Spasm",
    "Hypomobility",
    "Endpoint Tenderness",
    "Edema",
    "Decreased Segmental ROM",
  ];
  const isFormComplete =
    subjectiveSummary && objectiveSummary && assessment && plan;

  useEffect(() => {
    if (plan) {
      // Adjustments
      const adjustedSegments = spinalSegments.filter((segment) => {
        const regex = new RegExp(`\\b${segment}\\b`, "i"); // Match whole words only
        return regex.test(plan);
      });

      // Supportive services
      const providedServices = services.filter((service) =>
        plan.includes(service)
      );

      // Additional CPT Codes
      const cptCodesInPlan = cptCodes
        .filter((cpt) => plan.includes(cpt.code))
        .map((cpt) => cpt.code);

      setAdjustments(adjustedSegments);
      setSupportiveServices(providedServices);
      setAdditionalCPTs(cptCodesInPlan);
    } else {
      // Reset adjustments, services, and additional CPTs if no plan
      setAdjustments([]);
      setSupportiveServices([]);
      setAdditionalCPTs([]);
    }
  }, [plan, cptCodes]);

  useEffect(() => {
    // Reset fields if there's no SOAP note for the selected appointment
    if (!soapId) {
      setSelectedAreas([]);
      setPrimaryComplaint("");
      setSubjectiveSummary("");
      setSelectedRestrictions([]);
      setSelectedReveals([]);
      setObjectiveSummary("");
      setAssessment("");
      setPlan("");
      setAdditionalCPTs([]);
      setAmount(0);
      setInvoiceStatus("Not Issued");
    } else {
      // Parse existing SOAP data if available
      if (subjective) {
        const { areas, complaint } = parseSubjectiveString(subjective);
        setSelectedAreas(areas);
        setPrimaryComplaint(complaint);
      }
      if (objective) {
        const { restrictions, reveals } = parseObjectiveString(objective);
        setSelectedRestrictions(restrictions);
        setSelectedReveals(reveals);
      }
    }
  }, [appointment, soapId, subjective, objective]);

  // Calculate total amount based on selected adjustments and additional CPT codes
  useEffect(() => {
    const segmentCount = adjustments.length;

    let cptPrice = 0;
    if (segmentCount >= 5) {
      cptPrice = getPriceForCode("98942");
    } else if (segmentCount >= 3) {
      cptPrice = getPriceForCode("98941");
    } else if (segmentCount >= 1) {
      cptPrice = getPriceForCode("98940");
    }

    // Calculate additional CPT prices
    const additionalCPTPrice = additionalCPTs.reduce((total, code) => {
      const price = getPriceForCode(code);
      console.log("Additional CPT Code:", code, "Price:", price);
      return total + price;
    }, 0);

    // Ensure correct types and rounding
    const totalAmount = parseFloat(cptPrice) + parseFloat(additionalCPTPrice);
    const roundedTotalAmount = Math.round(totalAmount * 100) / 100; // Round to 2 decimal places

    console.log("Total Amount:", roundedTotalAmount);

    setAmount(roundedTotalAmount);
  }, [adjustments, additionalCPTs, cptCodes]);

  // Update subjective summary automatically
  useEffect(() => {
    if (patient) {
      const areaText = selectedAreas.join(", ");
      if (selectedAreas.length > 0 && primaryComplaint) {
        const summary = `${patient.firstname} presented to the office for a primary reason of ${areaText} pain. ${patient.firstname} states that they are ${primaryComplaint} since the last visit.`;
        setSubjectiveSummary(summary);
      }
    }
  }, [selectedAreas, primaryComplaint, patient]);

  // Update objective summary automatically
  useEffect(() => {
    if (patient) {
      const restrictionText = selectedRestrictions.join(", ");

      // Join all reveals into a single sentence
      const revealsText =
        selectedReveals.length > 0
          ? `Palpation reveals areas of ${selectedReveals
              .join(", ")
              .toLowerCase()}, all indicative of subluxation.`
          : "";

      let summary = "";

      if (selectedRestrictions.length > 0) {
        summary = `Since the last visit, palpation of ${patient.firstname}'s spine and extremities reveals the following areas of subluxations: ${restrictionText}.`;
      }

      if (revealsText) {
        summary += ` ${revealsText}`;
      }

      setObjectiveSummary(summary.trim());
    }
  }, [selectedRestrictions, selectedReveals, patient]);

  useEffect(() => {
    // Update the plan summary whenever adjustments, services, or additionalCPTs change
    const adjustmentText = adjustments.join(", ");
    const serviceText = supportiveServices.join(", ");
    const additionalCPTText = additionalCPTs.join(", ");

    const summary = `The following segments were adjusted: ${adjustmentText}. Supportive services performed today: ${serviceText}. Additional CPTs: ${additionalCPTText}.`;

    setPlan(summary);
  }, [adjustments, supportiveServices, additionalCPTs, setPlan]);

  // Function to parse subjective string
  const parseSubjectiveString = (subjectiveString) => {
    if (!subjectiveString) return { areas: [], complaint: "" };

    const areasMatch = subjectiveString.match(/primary reason of (.*) pain/);
    const complaintMatch = subjectiveString.match(
      /they are (.*) since the last visit/
    );

    const areas = areasMatch
      ? areasMatch[1]
          .split(", ")
          .filter((area) => discomfortAreas.includes(area))
      : [];
    const complaint = complaintMatch ? complaintMatch[1] : "";

    return { areas, complaint };
  };

  const parseObjectiveString = (objectiveString) => {
    if (!objectiveString) return { restrictions: [], reveals: [] };

    let parsedRestrictions = [];
    let parsedReveals = [];

    // Normalize function to handle case and trim extra spaces
    const normalize = (str) => str.trim().toLowerCase();

    // Extract restrictions (areas of subluxations)
    const restrictionsMatch = objectiveString.match(
      /areas of subluxations:\s*(.*?)\./
    );
    if (restrictionsMatch && restrictionsMatch[1]) {
      parsedRestrictions = restrictionsMatch[1]
        .split(", ")
        .map(normalize)
        .filter((item) => restrictions.map(normalize).includes(item));
    }

    // Extract reveals (areas of reveals)
    const revealsMatch = objectiveString.match(/reveals areas of\s*(.*?)\./);
    if (revealsMatch && revealsMatch[1]) {
      parsedReveals = revealsMatch[1]
        .split(", ")
        .map(normalize)
        .filter((item) => reveals.map(normalize).includes(item));
    }

    // Match parsed items back to original case-sensitive options
    parsedRestrictions = parsedRestrictions.map((item) =>
      restrictions.find((r) => normalize(r) === item)
    );
    parsedReveals = parsedReveals.map((item) =>
      reveals.find((r) => normalize(r) === item)
    );

    return { restrictions: parsedRestrictions, reveals: parsedReveals };
  };

  const handleAreaSelection = (area) => {
    setSelectedAreas((prevSelected) =>
      prevSelected.includes(area)
        ? prevSelected.filter((item) => item !== area)
        : [...prevSelected, area]
    );
  };

  const handleComplaintSelection = (complaint) => {
    setPrimaryComplaint(complaint);
  };

  const handleRestrictionSelection = (restriction) => {
    setSelectedRestrictions((prevSelected) =>
      prevSelected.includes(restriction)
        ? prevSelected.filter((item) => item !== restriction)
        : [...prevSelected, restriction]
    );
  };

  const handleRevealSelection = (reveal) => {
    setSelectedReveals((prevSelected) =>
      prevSelected.includes(reveal)
        ? prevSelected.filter((item) => item !== reveal)
        : [...prevSelected, reveal]
    );
  };

  const handleAdjustmentSelection = (segment) => {
    setAdjustments((prevSelected) =>
      prevSelected.includes(segment)
        ? prevSelected.filter((item) => item !== segment)
        : [...prevSelected, segment]
    );
  };

  const handleServiceSelection = (service) => {
    setSupportiveServices((prevSelected) =>
      prevSelected.includes(service)
        ? prevSelected.filter((item) => item !== service)
        : [...prevSelected, service]
    );
  };

  const handleAdditionalCPTSelection = (code) => {
    setAdditionalCPTs((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  };

  const getPriceForCode = (code) => {
    const cpt = cptCodes.find((c) => c.code === code);
    return cpt ? parseFloat(cpt.price) || 0 : 0;
  };

  const renderSubjectiveStep = () => (
    <Box>
      <Box>
        <Typography variant="h6">Select Areas of Discomfort:</Typography>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          {discomfortAreas.map((area) => (
            <Grid item xs={6} sm={4} md={3} key={area}>
              <Button
                variant={
                  selectedAreas.includes(area) ? "contained" : "outlined"
                }
                color="primary"
                fullWidth
                onClick={() => handleAreaSelection(area)}
              >
                {area}
              </Button>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setSelectedAreas([])}
          >
            Cancel All
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ marginTop: 3 }}>
          Primary Complaint:
        </Typography>
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant={primaryComplaint === "better" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComplaintSelection("better")}
          >
            Better
          </Button>
          <Button
            variant={primaryComplaint === "same" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComplaintSelection("same")}
            sx={{ marginLeft: 2 }}
          >
            Same
          </Button>
          <Button
            variant={primaryComplaint === "worse" ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleComplaintSelection("worse")}
            sx={{ marginLeft: 2 }}
          >
            Worse
          </Button>
        </Box>
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setPrimaryComplaint("")}
          >
            Cancel Selection
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderObjectiveStep = () => (
    <Box>
      <Typography variant="h6">Where were restrictions found:</Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {restrictions.map((restriction) => (
          <Grid item xs={6} sm={4} md={3} key={restriction}>
            <Button
              variant={
                selectedRestrictions.includes(restriction)
                  ? "contained"
                  : "outlined"
              }
              color="primary"
              fullWidth
              onClick={() => handleRestrictionSelection(restriction)}
            >
              {restriction}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setSelectedRestrictions([])}
        >
          Cancel All
        </Button>
      </Box>

      <Typography variant="h6" sx={{ marginTop: 3 }}>
        Palpation Reveals:
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {reveals.map((reveal) => (
          <Grid item xs={6} sm={4} md={3} key={reveal}>
            <Button
              variant={
                selectedReveals.includes(reveal) ? "contained" : "outlined"
              }
              color="primary"
              fullWidth
              onClick={() => handleRevealSelection(reveal)}
            >
              {reveal}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setSelectedReveals([])}
        >
          Cancel All
        </Button>
      </Box>
    </Box>
  );

  const renderAssessmentStep = () => (
    <TextField
      fullWidth
      margin="normal"
      label="Assessment"
      variant="outlined"
      value={assessment}
      onChange={(e) => setAssessment(e.target.value)}
      multiline
      rows={4}
    />
  );

  const renderPlanStep = () => (
    <Box>
      {/* Adjustments */}
      <Typography variant="h6">Select Adjusted Segments:</Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {spinalSegments.map((segment) => (
          <Grid item xs={6} sm={4} md={3} key={segment}>
            <Button
              variant={adjustments.includes(segment) ? "contained" : "outlined"}
              color="primary"
              fullWidth
              onClick={() => handleAdjustmentSelection(segment)}
            >
              {segment}
            </Button>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setAdjustments([])}
        >
          Clear All
        </Button>
      </Box>

      {/* Supportive Services */}
      <Typography variant="h6" sx={{ marginTop: 3 }}>
        Supportive Services Provided:
      </Typography>
      <Box sx={{ marginTop: 2 }}>
        {services.map((service) => (
          <Button
            key={service}
            variant={
              supportiveServices.includes(service) ? "contained" : "outlined"
            }
            color="primary"
            onClick={() => handleServiceSelection(service)}
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            {service}
          </Button>
        ))}
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setSupportiveServices([])}
        >
          Clear Services
        </Button>
      </Box>

      {/* Additional CPT Code Selection */}
      <Typography variant="h6" sx={{ marginTop: 3 }}>
        Additional CPT Codes:
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {cptCodes
          .filter(
            (cpt) => !["98940", "98941", "98942"].includes(cpt.code) // Filter out the main adjustment CPT codes
          )
          .map((cpt) => (
            <Grid item xs={6} sm={4} md={3} key={cpt.id}>
              <Button
                variant={
                  additionalCPTs.includes(cpt.code) ? "contained" : "outlined"
                }
                onClick={() => handleAdditionalCPTSelection(cpt.code)}
              >
                {cpt.code} - {cpt.description} (${cpt.price})
              </Button>
            </Grid>
          ))}
      </Grid>
    </Box>
  );

  const handleNext = () => {
    if (activeStep === 0 && (!selectedAreas.length || !primaryComplaint)) {
      alert("Please select areas of discomfort and primary complaint.");
      return;
    }
    if (
      activeStep === 1 &&
      (!selectedRestrictions.length || !selectedReveals.length)
    ) {
      alert("Please select areas of restriction and palpation reveals.");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAction = async (actionStatus) => {
    const newStatus = actionStatus === "submit" ? "Complete" : "Draft";
    setStatus(newStatus);

    const isComplete = newStatus === "Complete";
    const finalInvoiceStatus =
      isComplete || appointment.status === "Completed" ? "Due" : "Not Issued";
    setInvoiceStatus(finalInvoiceStatus);

    try {
      if (soapId) {
        // Update the SOAP note
        await executeQuery(
          `UPDATE soaps SET subjective = $1, objective = $2, assessment = $3, plan = $4, status = $5 WHERE id = $6`,
          [
            subjectiveSummary,
            objectiveSummary,
            assessment,
            plan,
            newStatus,
            soapId,
          ],
          "soaps"
        );
      } else {
        // Insert a new SOAP note
        await executeQuery(
          `INSERT INTO soaps (patient_id, provider_id, appointment_id, subjective, objective, assessment, plan, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            patient.patientid,
            appointment.provider_id,
            appointment.appointment_id,
            subjectiveSummary,
            objectiveSummary,
            assessment,
            plan,
            newStatus,
          ],
          "soaps"
        );
      }

      // Update appointment invoice status and amount
      await executeQuery(
        `UPDATE appointments SET invoice_status = $1, amount = $2 WHERE appointment_id = $3`,
        [finalInvoiceStatus, displayAmount, appointment.appointment_id],
        "appointments"
      );

      if (newStatus === "Complete") {
        await executeQuery(
          `UPDATE appointments SET status = 'Completed' WHERE appointment_id = $1`,
          [appointment.appointment_id],
          "appointments"
        );
      } else {
        if (appointment.status !== "Completed") {
          await executeQuery(
            `UPDATE appointments SET status = 'Drafted' WHERE appointment_id = $1`,
            [appointment.appointment_id],
            "appointments"
          );
        }
      }

      alert(
        `SOAP note ${
          newStatus === "Complete" ? "submitted" : "saved as draft"
        } successfully.`
      );

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error handling SOAP note:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderSubjectiveStep();
      case 1:
        return renderObjectiveStep();
      case 2:
        return renderAssessmentStep();
      case 3:
        return renderPlanStep();
      default:
        return "Unknown step";
    }
  };

  if (!patient || !appointment) {
    return <Typography>Select an appointment to create a SOAP note</Typography>;
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box flex={1}>
          <Typography variant="h6" gutterBottom>
            Patient Details
          </Typography>
          <Typography variant="body1">
            <strong>Name:</strong> {patient.firstname} {patient.lastname}
          </Typography>
          <Typography variant="body1">
            <strong>Date of Birth:</strong>{" "}
            {new Date(patient.dateofbirth).toLocaleDateString("en-GB")}
          </Typography>
          <Typography variant="body1">
            <strong>Appointment Time:</strong> {appointment.appointment_time}
          </Typography>
          <Typography variant="body1">
            <strong>Appointment Type:</strong> {appointment.appointment_type}
          </Typography>
          <Typography variant="body1">
            <strong>Appointment Status:</strong> {appointment.status}
          </Typography>
          <Typography variant="body1">
            <strong>SOAP Status:</strong> {status}
          </Typography>
          <Typography variant="body1">
            <strong>Total Amount:</strong> ${Number(amount).toFixed(2)}
          </Typography>
          <Typography variant="body1">
            <strong>Invoice Status:</strong> {appointment.invoice_status}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "40%",
            height: "400px",
            overflowY: "scroll",
            border: "1px solid #ddd",
            padding: 2,
            borderRadius: 1,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6">SOAP Note Details:</Typography>
          <Typography variant="h6" mt={2}>
            Subjective:
          </Typography>
          <Typography variant="body1">{subjectiveSummary}</Typography>
          <Typography variant="h6" mt={2}>
            Objective:
          </Typography>
          <Typography variant="body1">{objectiveSummary}</Typography>
          <Typography variant="h6" mt={2}>
            Assessment:
          </Typography>
          <Typography variant="body1">{assessment}</Typography>
          <Typography variant="h6" mt={2}>
            Plan:
          </Typography>
          <Typography variant="body1">{plan}</Typography>
        </Box>
      </Box>

      <Box sx={{ width: "100%", marginTop: 2 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ marginTop: 2 }}>{renderStepContent(activeStep)}</Box>
        <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ marginRight: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button
            disabled={activeStep === 3}
            ariant="contained"
            color="primary"
            onClick={handleNext}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleAction("draft")}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleAction("submit")}
          disabled={!isFormComplete}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default SOAPNote;
