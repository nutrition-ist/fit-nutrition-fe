import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";

/* ---------- local interfaces ---------- */
interface Appointment {
  id: number;
  patient: number;
  date_time: string;
  is_active: boolean; // true ↔ active / confirmed, false ↔ cancelled
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Props {
  appointment: Appointment;
  patients: Patient[];
  dense?: boolean; // list view (no card chrome) vs. grid view
}
/* -------------------------------------- */

/**
 * Returns the correct <Chip /> for an appointment.
 *  – Cancelled  → red chip (always)
 *  – Confirmed  → green chip (future & active)
 *  – Pending    → yellow chip (past & still active)
 */
const renderStatusChip = (appt: Appointment) => {
  if (!appt.is_active) {
    return <Chip label="Cancelled" size="small" color="error" />;
  }

  const apptTime = dayjs(appt.date_time);
  const now = dayjs();

  const isFuture = apptTime.isAfter(now);

  return (
    <Chip
      label={isFuture ? "Confirmed" : "Pending"}
      size="small"
      color={isFuture ? "success" : "warning"}
    />
  );
};

const AppointmentCard: React.FC<Props> = ({ appointment, patients, dense }) => {
  const patient = patients.find((p) => p.id === appointment.patient);
  const dateObj = dayjs(appointment.date_time);

  return (
    <Card
      variant="outlined"
      sx={
        dense
          ? { border: "none", borderRadius: 0, boxShadow: "none" }
          : undefined
      }
    >
      <CardActionArea>
        <CardContent>
          <Stack
            direction={dense ? "row" : "column"}
            spacing={dense ? 2 : 1}
            alignItems={dense ? "center" : "flex-start"}
          >
            <Typography fontWeight={600}>
              {patient
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown patient"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {dateObj.format("D MMM YYYY, h:mm A")}
            </Typography>

            {renderStatusChip(appointment)}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default AppointmentCard;
