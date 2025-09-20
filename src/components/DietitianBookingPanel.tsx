"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import axios from "axios";
import AppointmentsCalendar, {
  Appointment as CalAppointment,
} from "@/components/AppointmentsCalendar";

interface Props {
  dietitianId: number;
}

const DietitianBookingPanel: React.FC<Props> = ({ dietitianId }) => {
  const [appointments, setAppointments] = useState<CalAppointment[]>([]);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://hazalkaynak.pythonanywhere.com/";

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAppointments([]);
        return;
      }
      const { data } = await axios.get<{ appointments: CalAppointment[] }>(
        `${apiBase}appointment/get/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(
        Array.isArray(data)
          ? (data as unknown as CalAppointment[])
          : data.appointments ?? []
      );
    } catch {
      setAppointments([]);
    }
  }, [apiBase]);

  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  const handleBook = async (isoDateTime: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please log in to book.");
        return;
      }
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const patientId = profile?.patient_id;
      if (!patientId) {
        alert("Patient profile not found.");
        return;
      }
      await axios.post(
        `${apiBase}appointment/add/`,
        {
          patient: patientId,
          dietician: dietitianId,
          date_time: isoDateTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
      alert("Appointment requested. Waiting for dietitian approval.");
    } catch {
      alert("Failed to request appointment.");
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Book an appointment
      </Typography>
      <Box>
        <AppointmentsCalendar
          role="patient"
          appointments={appointments}
          workingDays={[false, true, true, true, true, true, false]}
          workingHours={{ startHour: 9, endHour: 17, slotMinutes: 30 }}
          blockedDates={[]}
          onCreate={handleBook}
        />
      </Box>
    </Paper>
  );
};

export default DietitianBookingPanel;
