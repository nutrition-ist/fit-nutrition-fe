"use client";

import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
  Divider,
  Avatar,
  TextField,
  InputAdornment,
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

import RegisterPatient from "@/components/RegisterPatient";
import SocialLinks from "@/components/SocialLinks";

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
  dietician: number;
  profile_picture: string | null;
}

interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active: boolean;
}

interface DietitianDashboardData {
  dietitian: Dietitian;
  patients_list: Patient[];
  appointment_list: Appointment[];
}

const DietitianDashboard: React.FC = () => {
  /** -------------- state -------------- */
  const [profile, setProfile] = useState<DietitianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // dialog + view toggles
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [apptView, setApptView] = useState<"list" | "grid">("grid");
  const [apptFilter, setApptFilter] = useState<"today" | "week" | "all">(
    "week"
  );

  /** -------------- data fetch -------------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login?redirect=dietitian-dashboard";
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://hazalkaynak.pythonanywhere.com/";

    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}dietitian/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          dietitian: res.data.dietician,
          patients_list: res.data.patients_list ?? [], 
          appointment_list: res.data.appointment_list ?? [],
        });
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

    fetchData();
  }, []);

  /** -------------- derived counts -------------- */
  const upcomingThisWeek = useMemo(() => {
    if (!profile?.appointment_list) return 0;

    const endOfWeek = dayjs().endOf("week");

    return profile.appointment_list.filter((a) =>
      dayjs(a.date_time).isBefore(endOfWeek)
    ).length;
  }, [profile]);

  // mocked numbers until backend sends them
  const newNotes = 4;
  const needsReview = 5;

  /** -------------- handlers -------------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewPatient = (p: any) =>
    setProfile((prev) =>
      prev ? { ...prev, patients_list: [...prev.patients_list, p] } : prev
    );

  /** -------------- render -------------- */
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
      {/* ---------- Heading ---------- */}
      <Typography variant="h4" fontWeight={600} mb={3}>
        Welcome Back, {profile.dietitian.first_name}!
      </Typography>
      {/* ---------- KPI Tiles ---------- */}
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
      {/* ---------- Clients ---------- */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Your Clients</Typography>
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
      {/* register-patient dialog (uses your unchanged component) */}
      <RegisterPatient
        open={openPatientDialog}
        onClose={() => setOpenPatientDialog(false)}
        onPatientRegistered={handleNewPatient}
      />
      {/* ---------- Appointments ---------- */}
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
            size="small"
            variant={apptView === "list" ? "contained" : "outlined"}
            onClick={() => setApptView("list")}
          >
            List View
          </Button>
          <Button
            size="small"
            variant={apptView === "grid" ? "contained" : "outlined"}
            onClick={() => setApptView("grid")}
          >
            Grid View
          </Button>
          <Button variant="contained" color="primary">
            Schedule New Appointment
          </Button>
        </Stack>
      </Stack>
      {/*
        The mock-ups show the same appointment repeated; we dedupe + filter so
        today/week tabs behave.
      */}

      <Grid
        container
        spacing={apptView === "grid" ? 2 : 0}
        direction={apptView === "list" ? "column" : "row"}
      >
        {appointments
          .filter((a) => {
            if (apptFilter === "today")
              return dayjs(a.date_time).isSame(dayjs(), "day");
            if (apptFilter === "week")
              return dayjs(a.date_time).isSame(dayjs(), "week");
            return true;
          })
          .map((a) =>
            apptView === "grid" ? (
              <Grid item xs={12} sm={6} lg={3} key={a.id}>
                <AppointmentCard
                  appointment={a}
                  patients={profile.patients_list}
                />
              </Grid>
            ) : (
              <Box key={a.id}>
                <AppointmentCard
                  appointment={a}
                  patients={profile.patients_list}
                  dense
                />
                <Divider />
              </Box>
            )
          )}
      </Grid>
      {/* ---------- Recipes ---------- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mt={6}
      >
        <Typography variant="h6">Your Recipes</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small">
            View All Recipes
          </Button>
          <Button variant="contained" size="small">
            Add New Recipe
          </Button>
        </Stack>
      </Stack>
      {/* Very light placeholder – replace with your real component later */}
      <Stack mt={2} spacing={2}>
        {[
          "Greek Yoghurt Protein Bowl",
          "Spiced Lentil Salad",
          "Grilled Salmon & Greens",
        ].map((name, idx) => (
          <Card key={name} sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                variant="rounded"
                src={`/images/recipes/${idx + 1}.jpg`}
                sx={{ width: 56, height: 56 }}
              />
              <Box flex={1}>
                <Typography fontWeight={600}>{name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {idx === 0 &&
                    "High Protein • 320 kcal • 25g protein • 12g carbs • 18g fat"}
                  {idx === 1 &&
                    "Vegan, Gluten-Free • 280 kcal • 14g protein • 32g carbs • 8g fat"}
                  {idx === 2 &&
                    "Pescatarian • 450 kcal • 35g protein • 10g carbs • 28g fat"}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {idx === 0 && "15 Shares"}
                {idx === 1 && "155 Shares"}
                {idx === 2 && "885 Shares"}
              </Typography>
            </Stack>
          </Card>
        ))}
      </Stack>
      {/* ---------- Contact ---------- */}
      <Stack mt={6} spacing={1}>
        <Typography variant="h6">Contact & Socials</Typography>
        <Typography>Phone: {profile.dietitian.phone}</Typography>
        <Typography>Address: {profile.dietitian.address}</Typography>
        <SocialLinks dietitian={profile.dietitian} />
      </Stack>
    </Box>
  );
};

export default DietitianDashboard;
