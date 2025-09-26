"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Card,
  CardActionArea,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import RecipeList from "@/components/RecipeList";
import PatientSettingsDialog, {
  PatientPrefsPayload,
} from "@/components/PatientSettingsDialog";
import DietitianCard, {
  Dietitian as DietitianType,
} from "@/components/DietitianCard";
import AppointmentCard from "@/components/AppointmentCard";
import AppointmentsCalendar, {
  Appointment as CalAppointment,
} from "@/components/AppointmentsCalendar";
import MeasurementsChart from "@/components/MeasurementsChart";
import MeasurementHistory from "@/components/MeasurementHistory";

/* types */
type DietitianWire = Partial<DietitianType> & { id?: number };
type DietitianInput =
  | number
  | DietitianWire
  | { dietician?: number | DietitianWire }
  | null
  | undefined;

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
  meal_plans?: { id: number; title: string }[] | number;
}

/* helpers */
const normalizeDietitian = (raw: DietitianInput): DietitianType | null => {
  if (raw == null) return null;
  const source: number | DietitianWire =
    typeof raw === "object" && "dietician" in raw && raw.dietician !== undefined
      ? raw.dietician
      : (raw as number | DietitianWire);

  if (typeof source === "number") {
    return {
      id: source,
      username: "",
      first_name: "",
      last_name: "",
      profile_picture: null,
      about_me: undefined,
      qualifications: [],
      available: undefined,
      next_available_date: undefined,
      online_booking: true,
    };
  }
  return {
    id: Number(source.id ?? 0),
    username: String(source.username ?? ""),
    first_name: String(source.first_name ?? ""),
    last_name: String(source.last_name ?? ""),
    profile_picture: source.profile_picture ?? null,
    about_me: source.about_me ?? undefined,
    qualifications: Array.isArray(source.qualifications)
      ? source.qualifications
      : [],
    available: source.available ?? undefined,
    next_available_date: source.next_available_date ?? undefined,
    online_booking: source.online_booking ?? true,
  };
};

const LOCAL_KEYS = [
  "measure_history_v1",
  "fn_measurements",
  "fit_measurements",
  "measurements_history",
];

const readLocalHistory = (): { timestamp: string; weightKg?: number }[] => {
  try {
    const raw =
      LOCAL_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ?? "[]";
    const parsed = JSON.parse(raw) as unknown[];
    const mapOne = (e: unknown) => {
      if (typeof e !== "object" || e === null) return null;
      const o = e as Record<string, unknown>;
      const ts =
        (typeof o.timestamp === "string" && o.timestamp) ||
        (typeof o.date === "string" && o.date);
      if (!ts) return null;
      const w = typeof o.weightKg === "number" ? o.weightKg : undefined;
      return { timestamp: ts, weightKg: w };
    };
    return Array.isArray(parsed)
      ? (parsed.map(mapOne).filter(Boolean) as {
          timestamp: string;
          weightKg?: number;
        }[])
      : [];
  } catch {
    return [];
  }
};

/* tile */
const DashTile: React.FC<{
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  fullWidth?: boolean;
}> = ({ href, onClick, icon, title, subtitle, fullWidth }) => {
  const content = (
    <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          bgcolor: "grey.100",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  );

  return (
    <Grid item xs={12} sm={6} md={fullWidth ? 12 : 3}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        {onClick ? (
          <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
            {content}
          </CardActionArea>
        ) : (
          <Link href={href ?? "#"} passHref legacyBehavior>
            <CardActionArea sx={{ height: "100%" }}>{content}</CardActionArea>
          </Link>
        )}
      </Card>
    </Grid>
  );
};

/* page */
const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [dietitian, setDietitian] = useState<DietitianType | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [mealPlanCount, setMealPlanCount] = useState(0);

  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://hazalkaynak.pythonanywhere.com/";

  const weightEntries = useMemo(
    () =>
      readLocalHistory().map((e) => ({
        date: e.timestamp,
        weightKg: e.weightKg,
      })),
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login?redirect=patient-dashboard";
      return;
    }
    const authHeaders = { Authorization: `Bearer ${token}` };

    let mounted = true;

    (async () => {
      try {
        const res = await axios.get(`${api}patient/me/`, {
          headers: authHeaders,
        });
        if (!mounted) return;

        const payload: PatientDashboardData = {
          patient: res.data.patient ?? res.data,
          meal_plans: res.data.meal_plans ?? [],
        };
        setData(payload);

        try {
          const mpRes = await axios.get(`${api}mealplan/get/`, {
            headers: authHeaders,
          });
          const list = Array.isArray(mpRes.data)
            ? mpRes.data
            : Array.isArray(mpRes.data?.results)
            ? mpRes.data.results
            : [];
          if (mounted) setMealPlanCount(list.length);
        } catch {
          const fallback = Array.isArray(payload.meal_plans)
            ? payload.meal_plans.length
            : Number(payload.meal_plans ?? 0);
          if (mounted) setMealPlanCount(fallback);
        }

        const dField = payload.patient?.dietician ?? null;
        const normal = normalizeDietitian(dField);
        if (normal && normal.id && !normal.username) {
          try {
            const r1 = await axios.get(`${api}dietician/${normal.id}/`, {
              headers: authHeaders,
            });
            if (mounted) setDietitian(normalizeDietitian(r1.data));
          } catch {
            try {
              const r2 = await axios.get(`${api}dietitian/${normal.id}/`, {
                headers: authHeaders,
              });
              if (mounted) setDietitian(normalizeDietitian(r2.data));
            } catch {
              if (mounted) setDietitian(null);
            }
          }
        } else if (mounted) {
          setDietitian(normal);
        }

        const ar = await axios.get<Appointment[]>(`${api}appointment/get/`, {
          headers: authHeaders,
        });
        if (mounted) setAppointments(Array.isArray(ar.data) ? ar.data : []);
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login?redirect=patient-dashboard";
          return;
        }
        if (mounted) setErr("Failed to load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api]);

  const nextApptText = useMemo(() => {
    if (!appointments.length) return "No appointment booked";
    const soonest = [...appointments].sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )[0];
    return dayjs(soonest.date_time).format("D MMM YYYY, h:mm A");
  }, [appointments]);

  const createAppointment = async (dateTimeIso: string) => {
    if (!data?.patient) return;
    const dieticianId =
      typeof data.patient.dietician === "number"
        ? data.patient.dietician
        : (data.patient.dietician as DietitianType | null)?.id || 0;
    if (!dieticianId) {
      setToast({ type: "error", msg: "No dietitian linked to your account." });
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        patient: data.patient.id,
        dietician: dieticianId,
        date_time: dateTimeIso,
      };
      await axios.post(`${api}appointment/add/`, payload, { headers });
      const ar = await axios.get<Appointment[]>(`${api}appointment/get/`, {
        headers,
      });
      setAppointments(Array.isArray(ar.data) ? ar.data : []);
      setToast({ type: "success", msg: "Appointment booked." });
    } catch {
      setToast({ type: "error", msg: "Failed to book appointment." });
    }
  };

  const cancelAppointment = async (id: number) => {
    const ok = window.confirm("Cancel this appointment?");
    if (!ok) return;
    try {
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${api}appointment/delete/${id}/`, { headers });
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setToast({ type: "success", msg: "Appointment cancelled." });
    } catch {
      setToast({ type: "error", msg: "Failed to cancel appointment." });
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
        <Typography variant="h4" component="h1" fontWeight={600}>
          Welcome back, {p.first_name}!
        </Typography>
        {/* top-right management button removed */}
      </Stack>

      {/* top four tiles */}
      <Grid container spacing={2} mb={4}>
        <DashTile
          icon={<CalendarMonthIcon fontSize="medium" />}
          title="Your Next Appointment"
          subtitle={nextApptText}
          href="/appointments"
        />
        <DashTile
          icon={<RestaurantMenuIcon fontSize="medium" />}
          title="Meal Plan"
          subtitle={`${mealPlanCount} in your library`}
          href="/meal-plans"
        />
        <DashTile
          icon={<RestaurantMenuIcon fontSize="medium" />}
          title="Recipes"
          subtitle="See the recipes your dietitian shared"
          href="/recipes"
        />
        <DashTile
          icon={<ManageAccountsIcon fontSize="medium" />}
          title="Profile Management"
          subtitle="Change your settings"
          onClick={() => setPrefsOpen(true)}
        />
      </Grid>

      <Box mb={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box>
            <Typography variant="h5" component="h2">
              Your Measurements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See how your body changed
            </Typography>
          </Box>
          <Button
            href="/measurements"
            component={Link}
            variant="contained"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Add Measurements
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <MeasurementsChart
              entries={weightEntries}
              yKey="weightKg"
              height={260}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Last Measurements
            </Typography>
            <MeasurementHistory maxItems={2} minCardWidth={220} />
          </Grid>
        </Grid>
      </Box>

      {/* removed the lower quick-link tiles */}

      <Box mt={2} mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
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
          <Typography variant="h5" component="h2" gutterBottom>
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
            <AppointmentsCalendar
              role="patient"
              appointments={appointments as CalAppointment[]}
              workingHours={{ startHour: 9, endHour: 17 }}
              onCreate={createAppointment}
              onDelete={cancelAppointment}
            />
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
        <Typography variant="h5" component="h2">
          Recommended recipes
        </Typography>
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

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? <Alert severity={toast.type}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
};

export default PatientDashboard;
