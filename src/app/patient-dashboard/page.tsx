"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import SummaryTile from "@/components/SummaryTile";
import RecipeList from "@/components/RecipeList";
import BmiCard from "@/components/BmiCard";
import QuickActions from "@/components/QuickActions";
import PatientSettingsDialog, {
  PatientPrefsPayload,
} from "@/components/PatientSettingsDialog";
import DietitianCard, {
  Dietitian as DietitianType,
} from "@/components/DietitianCard";
import AppointmentCard from "@/components/AppointmentCard";
import AppointmentsCalendar from "@/components/AppointmentsCalendar";

interface Patient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  dietician: number | null | DietitianType;
  profile_picture: string | null;
}

interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active: boolean;
}

interface PatientDashboardData {
  patient: Patient;
  appointments?: Appointment[];
  upcoming_appointments?: Appointment[];
  meal_plans?: { id: number; title: string }[] | number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeDietitian = (raw: any): DietitianType => {
  const d = (raw?.dietician ?? raw) || {};
  return {
    id: Number(d.id ?? 0),
    username: String(d.username ?? ""),
    first_name: String(d.first_name ?? ""),
    last_name: String(d.last_name ?? ""),
    profile_picture: d.profile_picture ?? null,
    about_me: d.about_me ?? undefined,
    qualifications: Array.isArray(d.qualifications) ? d.qualifications : [],
    available: d.available ?? undefined,
    next_available_date: d.next_available_date ?? undefined,
    online_booking: d.online_booking ?? true,
  };
};

const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [dietitian, setDietitian] = useState<DietitianType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = useState<boolean>(false);

  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://hazalkaynak.pythonanywhere.com/";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login?redirect=patient-dashboard";
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const res = await axios.get(`${api}patient/me/`, { headers });

        const payload: PatientDashboardData = {
          patient: res.data.patient ?? res.data,
          appointments:
            res.data.appointments ?? res.data.upcoming_appointments ?? [],
          upcoming_appointments:
            res.data.upcoming_appointments ?? res.data.appointments ?? [],
          meal_plans: res.data.meal_plans ?? [],
        };
        setData(payload);

        const dField = payload.patient?.dietician ?? null;

        if (dField && typeof dField === "object") {
          setDietitian(normalizeDietitian(dField));
        } else if (typeof dField === "number") {
          try {
            const r1 = await axios.get(`${api}dietician/${dField}/`, {
              headers,
            });
            setDietitian(normalizeDietitian(r1.data));
          } catch {
            try {
              const r2 = await axios.get(`${api}dietitian/${dField}/`, {
                headers,
              });
              setDietitian(normalizeDietitian(r2.data));
            } catch {
              setDietitian(null);
            }
          }
        } else {
          setDietitian(null);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login?redirect=patient-dashboard";
            return;
          }
          if (e.response?.status === 404) {
            const username = localStorage.getItem("username") || "Patient";
            setData({
              patient: {
                id: -1,
                username,
                email: "",
                first_name: username,
                last_name: "",
                phone: null,
                dietician: null,
                profile_picture: null,
              },
              appointments: [],
              upcoming_appointments: [],
              meal_plans: [],
            });
            setLoading(false);
            return;
          }
        }
        setErr("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const appointments: Appointment[] = useMemo(
    () =>
      (data?.upcoming_appointments ??
        data?.appointments ??
        []) as Appointment[],
    [data]
  );

  const nextApptText = useMemo(() => {
    if (!appointments.length) return "No appointment booked";
    const soonest = [...appointments].sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )[0];
    return dayjs(soonest.date_time).format("D MMM YYYY, h:mm A");
  }, [appointments]);

  const mealPlanCount = Array.isArray(data?.meal_plans)
    ? data!.meal_plans!.length
    : Number(data?.meal_plans ?? 0);

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
  if (err || !data) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">{err ?? "Unknown error"}</Typography>
      </Box>
    );
  }

  const p = data.patient;

  const patientsForCards = [
    { id: p.id, first_name: p.first_name, last_name: p.last_name },
  ];

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={600}>
          Welcome back, {p.first_name}!
        </Typography>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setPrefsOpen(true)}
        >
          Management
        </Button>
      </Stack>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<CalendarMonthIcon fontSize="large" />}
            label="Next appointment"
            value={nextApptText}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<RestaurantMenuIcon fontSize="large" />}
            label="Meal plans"
            value={`${mealPlanCount} in your library`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryTile
            icon={<FavoriteBorderIcon fontSize="large" />}
            label="Wellbeing"
            value="Log BMI and track progress"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={6}>
          <QuickActions
            dietitianId={
              typeof p.dietician === "number"
                ? p.dietician
                : (p.dietician as DietitianType | null)?.id
            }
            onOpenSettings={() => setPrefsOpen(true)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BmiCard onSaved={() => {}} />
        </Grid>
      </Grid>

      <Box mt={2} mb={3}>
        <Typography variant="h6" gutterBottom>
          Your dietitian
        </Typography>
        {dietitian ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={5} lg={4}>
              <DietitianCard dietitian={dietitian} />
            </Grid>
          </Grid>
        ) : (
          <Button href="/dietitian" variant="contained" size="small">
            Find a dietitian
          </Button>
        )}
      </Box>

      {!!appointments.length && (
        <Box mt={1} mb={3}>
          <Typography variant="h6" gutterBottom>
            Your appointments
          </Typography>
          <Grid container spacing={2}>
            {appointments.slice(0, 3).map((a) => (
              <Grid item xs={12} sm={6} md={4} key={a.id}>
                <AppointmentCard
                  appointment={{
                    id: a.id,
                    patient: a.patient,
                    date_time: a.date_time,
                    is_active: a.is_active,
                  }}
                  patients={patientsForCards}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={2}>
            <AppointmentsCalendar appointments={appointments} />
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h6">Recommended recipes</Typography>
        <Button href="/recipes" variant="outlined" size="small">
          Browse all
        </Button>
      </Stack>
      <RecipeList globalOnly limit={4} grid />

      <PatientSettingsDialog
        open={prefsOpen}
        onClose={() => setPrefsOpen(false)}
        onSave={async (payload: PatientPrefsPayload) => {
          setPrefsOpen(false);
          try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            await axios.post(`${api}patient/preferences/`, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch {}
        }}
      />
    </Box>
  );
};

export default PatientDashboard;
