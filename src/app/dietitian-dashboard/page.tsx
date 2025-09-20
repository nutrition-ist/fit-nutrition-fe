"use client";

import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import axios from "axios";

import SummaryTile from "@/components/SummaryTile";
import ClientsRibbon from "@/components/ClientsRibbon";
import AppointmentCard from "@/components/AppointmentCard";
import AppointmentsCalendar, {
  Appointment as CalAppointment,
} from "@/components/AppointmentsCalendar";
import RegisterPatient from "@/components/RegisterPatient";
import SocialLinks from "@/components/SocialLinks";
import RecipeList from "@/components/RecipeList";

interface Dietitian {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  about_me?: string;
  qualifications: string[];
  phone: string;
  address: string;
  profile_picture: string | null;
  facebook: string | null;
  instagram: string | null;
  x_twitter: string | null;
  youtube: string | null;
  whatsapp: string | null;
}

interface Patient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dietitian: number;
  profile_picture: string | null;
}

interface ApiPatient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dietician: number;
  profile_picture: string | null;
}

interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active?: boolean;
  is_approved?: boolean;
}

interface DietitianDashboardData {
  dietitian: Dietitian;
  patients_list: Patient[];
  appointment_list: Appointment[];
}

type ApiMeResponse = {
  dietitian?: Dietitian;
  dietician?: Dietitian;
  patients_list?: ApiPatient[];
  appointment_list?: Appointment[];
};

const DietitianDashboard: React.FC = () => {
  const [profile, setProfile] = useState<DietitianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const [apptFilter, setApptFilter] = useState<"today" | "week" | "all">(
    "week"
  );

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://hazalkaynak.pythonanywhere.com/";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login?redirect=dietitian-dashboard";
      return;
    }

    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get<ApiMeResponse>(`${apiBase}dietitian/me/`, {
          headers,
        });

        const apiPatients = me.data.patients_list ?? [];
        const normalizedPatients: Patient[] = apiPatients.map((p) => ({
          id: p.id,
          username: p.username,
          email: p.email,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          dietitian: p.dietician,
          profile_picture: p.profile_picture,
        }));

        const norm: DietitianDashboardData = {
          dietitian: (me.data.dietitian ?? me.data.dietician)!,
          patients_list: normalizedPatients,
          appointment_list: [],
        };

        let appts: Appointment[] = [];
        try {
          const r = await axios.get(`${apiBase}appointment/get/`, { headers });
          const payload = r.data;
          if (Array.isArray(payload)) appts = payload as Appointment[];
          else if (Array.isArray(payload?.appointments))
            appts = payload.appointments as Appointment[];
        } catch {}

        setProfile({ ...norm, appointment_list: appts });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login?redirect=dietitian-dashboard";
        } else {
          setError("Failed to fetch profile. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, [apiBase]);

  const refreshAppointments = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !profile) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const r = await axios.get(`${apiBase}appointment/get/`, { headers });
      const payload = r.data;
      const appts: Appointment[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.appointments)
        ? payload.appointments
        : [];
      setProfile((prev) =>
        prev ? { ...prev, appointment_list: appts } : prev
      );
    } catch {}
  };

  const upcomingThisWeek = useMemo(() => {
    if (!profile?.appointment_list) return 0;
    const endOfWeek = dayjs().endOf("week");
    return profile.appointment_list.filter((a) =>
      dayjs(a.date_time).isBefore(endOfWeek)
    ).length;
  }, [profile]);

  const newNotes = 4;
  const needsReview = 5;

  const handleNewPatient = (newPatient: Patient) =>
    setProfile((prev: DietitianDashboardData | null) =>
      prev
        ? { ...prev, patients_list: [...prev.patients_list, newPatient] }
        : prev
    );

  const handleConfirmAppt = async (id: number) => {
    const ok = window.confirm("Do you want to confirm this appointment?");
    if (!ok) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");
      await axios.put(
        `${apiBase}appointment/approve/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshAppointments();
    } catch {
      alert("Could not confirm the appointment.");
    }
  };

  const handleDeleteAppt = async (id: number) => {
    const ok = window.confirm("Cancel this appointment?");
    if (!ok) return;
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No token");
      await axios.delete(`${apiBase}appointment/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshAppointments();
    } catch {
      alert("Failed to cancel appointment.");
    }
  };

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error || !profile) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{error ?? "Unknown error"}</Typography>
      </Box>
    );
  }

  const appointments = profile.appointment_list ?? [];

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Typography variant="h4" component="h1" fontWeight={600} mb={3}>
        Welcome Back, {profile.dietitian.first_name}!
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<CalendarMonthIcon fontSize="large" />}
            label="Upcoming Appointments"
            value={`${upcomingThisWeek} sessions booked this week`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<NoteAltIcon fontSize="large" />}
            label="Client Notes"
            value={`${newNotes} new notes added this week`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<TrendingUpIcon fontSize="large" />}
            label="Client Progress Alerts"
            value={`${needsReview} clients need a progress review`}
          />
        </Grid>
      </Grid>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" component="h2">
          Your Clients
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            size="small"
            placeholder="Search clients by name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            color="primary"
            size="small"
            onClick={() => setOpenPatientDialog(true)}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Stack>

      <ClientsRibbon clients={profile.patients_list} />
      <RegisterPatient
        open={openPatientDialog}
        onClose={() => setOpenPatientDialog(false)}
        onPatientRegistered={handleNewPatient}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        mt={5}
        mb={2}
      >
        <Stack direction="row" spacing={1} mb={{ xs: 1, md: 0 }}>
          <Button
            size="small"
            variant={apptFilter === "today" ? "contained" : "outlined"}
            onClick={() => setApptFilter("today")}
          >
            Today
          </Button>
          <Button
            size="small"
            variant={apptFilter === "week" ? "contained" : "outlined"}
            onClick={() => setApptFilter("week")}
          >
            This Week
          </Button>
          <Button
            size="small"
            variant={apptFilter === "all" ? "contained" : "outlined"}
            onClick={() => setApptFilter("all")}
          >
            Show All
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setPlannerOpen(true)}
          >
            Manage availability & slots
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {appointments
          .filter((a) => {
            if (apptFilter === "today")
              return dayjs(a.date_time).isSame(dayjs(), "day");
            if (apptFilter === "week")
              return dayjs(a.date_time).isSame(dayjs(), "week");
            return true;
          })
          .map((a) => (
            <Grid item xs={12} sm={6} lg={3} key={a.id}>
              <AppointmentCard
                appointment={{
                  id: a.id,
                  patient: a.patient,
                  date_time: a.date_time,
                  is_active: a.is_active === true || a.is_approved === true,
                }}
                patients={profile.patients_list.map((p) => ({
                  id: p.id,
                  first_name: p.first_name,
                  last_name: p.last_name,
                }))}
              />
            </Grid>
          ))}
      </Grid>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={6}
      >
        <Typography variant="h5" component="h2">
          Your Recipes
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small">
            View All Recipes
          </Button>
          <Button variant="contained" size="small">
            Add New Recipe
          </Button>
        </Stack>
      </Stack>
      <RecipeList ownerId={profile.dietitian.id} limit={3} />

      <Stack mt={6} spacing={1}>
        <Typography variant="h5" component="h2">
          Contact & Socials
        </Typography>
        <Typography>Phone: {profile.dietitian.phone}</Typography>
        <Typography>Address: {profile.dietitian.address}</Typography>
        <SocialLinks dietitian={profile.dietitian} />
      </Stack>

      <Dialog
        open={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Availability & bookings</DialogTitle>
        <DialogContent dividers>
          <AppointmentsCalendar
            role="dietitian"
            appointments={
              profile.appointment_list as unknown as CalAppointment[]
            }
            workingHours={{ startHour: 9, endHour: 17, slotMinutes: 30 }}
            blockedDates={[]}
            onConfirm={handleConfirmAppt}
            onDelete={handleDeleteAppt}
            patientLookup={(id) => {
              const p = profile.patients_list.find((x) => x.id === id);
              return p ? `${p.first_name} ${p.last_name}` : undefined;
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DietitianDashboard;
