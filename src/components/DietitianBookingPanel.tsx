"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Box, Card, CardContent, Typography, Alert } from "@mui/material";
import AppointmentsCalendar, {
  Appointment as CalAppointment,
} from "@/components/AppointmentsCalendar";

interface Props {
  dietitianId: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

const DietitianBookingPanel: React.FC<Props> = ({ dietitianId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<CalAppointment[]>([]);

  // fetch all appointments for the logged-in user, then filter to this dietitian
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = localStorage.getItem("accessToken");
        const res = await axios.get<{ data?: CalAppointment[] }>(
          `${API_BASE}appointment/get/`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );

        const all = Array.isArray(res.data as unknown as CalAppointment[])
          ? (res.data as unknown as CalAppointment[])
          : (res.data?.data ?? []);

        if (!cancelled) {
          setAppointments(
            (all || []).filter((a) => a.dietician === dietitianId)
          );
        }
      } catch {
        if (!cancelled) setErr("Failed to load availability.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dietitianId]);

  // create a new appointment (book the selected slot)
  const handleCreate = async (dateTimeIso: string): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErr("You need to be logged in to book an appointment.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE}appointment/add/`,
        {
          dietician: dietitianId,
          date_time: dateTimeIso,
          is_active: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // optimistic refresh: add a faux appointment entry
      // (backend usually sets id; here we trigger a refetch instead)
      const r = await axios.get<{ data?: CalAppointment[] }>(
        `${API_BASE}appointment/get/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const all = Array.isArray(r.data as unknown as CalAppointment[])
        ? (r.data as unknown as CalAppointment[])
        : (r.data?.data ?? []);
      setAppointments((all || []).filter((a) => a.dietician === dietitianId));
    } catch {
      setErr("Could not book that slot. Please try another time.");
    }
  };

  const workingDays = useMemo<boolean[]>(
    () => [false, true, true, true, true, true, false], // Mon–Fri
    []
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Book an appointment
        </Typography>

        {err && (
          <Box mb={2}>
            <Alert severity="error">{err}</Alert>
          </Box>
        )}

        <AppointmentsCalendar
          role="patient"
          appointments={appointments}
          workingDays={workingDays}
          workingHours={{ startHour: 9, endHour: 17, slotMinutes: 30 }}
          blockedDates={[]}
          onCreate={handleCreate} 
        />

        {loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading availability…
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DietitianBookingPanel;
