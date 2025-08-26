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
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import SummaryTile from "@/components/SummaryTile";
import RecipeList from "@/components/RecipeList";
import SocialLinks from "@/components/SocialLinks";
import BmiCard from "@/components/BmiCard";
import QuickActions from "@/components/QuickActions";
import PatientSettingsDialog, {
  PatientPrefsPayload,
} from "@/components/PatientSettingsDialog";

interface Patient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  dietician: number | null | Dietitian; // can be id *or* embedded object
  profile_picture: string | null;
}

interface Appointment {
  id: number;
  patient: number;
  dietician: number;
  date_time: string;
  is_active: boolean;
}

interface MealPlanSummary {
  id: number;
  title: string;
}

interface PatientDashboardData {
  patient: Patient;
  upcoming_appointments?: Appointment[];
  meal_plans?: MealPlanSummary[];
}

interface Dietitian {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  profile_picture: string | null;
  facebook: string | null;
  instagram: string | null;
  x_twitter: string | null;
  youtube: string | null;
  whatsapp: string | null;
}

const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [dietitian, setDietitian] = useState<Dietitian | null>(null);
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

    const run = async (): Promise<void> => {
      try {
        const res = await axios.get(`${api}patient/me/`, { headers });

        const payload: PatientDashboardData = {
          patient: res.data.patient ?? res.data,
          upcoming_appointments: res.data.upcoming_appointments ?? [],
          meal_plans: res.data.meal_plans ?? [],
        };
        setData(payload);

        const embedded =
          (res.data.dietician as Dietitian | undefined) ??
          (res.data.patient?.dietician as Dietitian | undefined);

        if (embedded && typeof embedded === "object") {
          setDietitian(embedded);
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
          // if (e.response?.status === 404) {
          //   const username = localStorage.getItem("username") || "Patient";
          //   setData({
          //     patient: {
          //       id: -1,
          //       username,
          //       email: "",
          //       first_name: username,
          //       last_name: "",
          //       phone: null,
          //       dietician: null,
          //       profile_picture: null,
          //     },
          //     upcoming_appointments: [],
          //     meal_plans: [],
          //   });
          //   setLoading(false);
          //   return;
          // }
        }
        setErr("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [api]);

  const nextApptText = useMemo(() => {
    const appts = data?.upcoming_appointments ?? [];
    if (!appts.length) return "No appointment booked";
    const soonest = [...appts].sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )[0];
    return dayjs(soonest.date_time).format("D MMM YYYY, h:mm A");
  }, [data]);

  const mealPlanCount = data?.meal_plans?.length ?? 0;

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
              typeof p.dietician === "number" ? p.dietician : undefined
            }
            onOpenSettings={() => setPrefsOpen(true)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BmiCard onSaved={() => {}} />
        </Grid>
      </Grid>

      <Box mt={2} mb={4}>
        <Typography variant="h6" gutterBottom>
          Your dietitian
        </Typography>

        {dietitian ? (
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <Avatar
                  sx={{ width: 64, height: 64 }}
                  src={
                    dietitian.profile_picture
                      ? `${api}${dietitian.profile_picture}`
                      : undefined
                  }
                >
                  {dietitian.first_name?.charAt(0)}
                  {dietitian.last_name?.charAt(0)}
                </Avatar>

                <Box flex={1}>
                  <Typography fontWeight={600}>
                    {dietitian.first_name} {dietitian.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dietitian.phone} · {dietitian.address}
                  </Typography>
                  <SocialLinks dietitian={dietitian} />
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button href={`/book`} variant="outlined" size="small">
                    Book session
                  </Button>
                  <Button
                    href={`/dietitian/${dietitian.id}`}
                    variant="contained"
                    size="small"
                  >
                    View profile
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                spacing={2}
              >
                <Avatar sx={{ width: 64, height: 64 }} />
                <Box flex={1}>
                  <Typography fontWeight={600}>
                    You do not have a dietitian yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Find a professional and start your personalised plan
                  </Typography>
                </Box>
                <Button href="/dietitian" variant="contained" size="small">
                  Find a dietitian
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

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
          } catch {
            // no-op
          }
        }}
      />
    </Box>
  );
};

export default PatientDashboard;
