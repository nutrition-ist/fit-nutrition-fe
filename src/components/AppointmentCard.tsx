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

interface Appointment {
  id: number;
  patient: number;
  date_time: string;
  is_active?: boolean;
  is_cancelled?: boolean;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
}

interface Props {
  appointment: Appointment;
  patients: Patient[];
  dense?: boolean;
}

const renderStatusChip = (appt: Appointment) => {
  if (appt.is_cancelled) {
    return <Chip label="Cancelled" size="small" color="error" />;
  }
  if (appt.is_active) {
    return <Chip label="Confirmed" size="small" color="success" />;
  }
  return <Chip label="Pending" size="small" color="warning" />;
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
