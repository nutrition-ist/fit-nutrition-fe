"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MealPlanBuilder from "@/components/MealPlanBuilder";

type Role = "dietitian" | "patient";

interface Dietitian {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
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

interface MealPlanItem {
  label: string;
  recipe_id?: number;
}

interface MealPlan {
  id: number;
  patient: number;
  dietician: number;
  title: string;
  items: MealPlanItem[];
  note?: string | null;
  created_at?: string;
}

type ApiMeDietitian = {
  dietitian?: Dietitian;
  dietician?: Dietitian;
  patients_list?: ApiPatient[];
};

type ApiMePatient = {
  patient: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    dietician: number | Dietitian | null;
    profile_picture: string | null;
  };
};

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchDietitianMe = async (): Promise<ApiMeDietitian> => {
  const { data } = await axios.get<ApiMeDietitian>(`${apiBase}dietitian/me/`, {
    headers: authHeaders(),
  });
  return data;
};

const fetchPatientMe = async (): Promise<ApiMePatient> => {
  const { data } = await axios.get<ApiMePatient>(`${apiBase}patient/me/`, {
    headers: authHeaders(),
  });
  return data;
};

const getMealPlansForPatient = async (
  patientId: number
): Promise<MealPlan[]> => {
  try {
    const { data } = await axios.get(`${apiBase}mealplan/get/`, {
      headers: authHeaders(),
      params: { patient: patientId },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const getMealPlansMine = async (): Promise<MealPlan[]> => {
  try {
    const { data } = await axios.get(`${apiBase}mealplan/get/`, {
      headers: authHeaders(),
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const createMealPlan = async (payload: {
  patient: number;
  dietician: number;
  title: string;
  items: MealPlanItem[];
  note?: string | null;
}): Promise<MealPlan | null> => {
  try {
    const { data } = await axios.post(`${apiBase}mealplan/add/`, payload, {
      headers: authHeaders(),
    });
    return data as MealPlan;
  } catch {
    return null;
  }
};

const MealPlansPage: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [meDietitian, setMeDietitian] = useState<Dietitian | null>(null);
  const [patientMe, setPatientMe] = useState<ApiMePatient["patient"] | null>(
    null
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const boot = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login?redirect=meal-plans";
        return;
      }
      try {
        try {
          const d = await fetchDietitianMe();
          const me = d.dietitian ?? d.dietician;
          if (me?.id) {
            setRole("dietitian");
            setMeDietitian(me);
            const apiPatients = d.patients_list ?? [];
            const normalized: Patient[] = apiPatients.map((p) => ({
              id: p.id,
              username: p.username,
              email: p.email,
              first_name: p.first_name,
              last_name: p.last_name,
              phone: p.phone,
              dietitian: p.dietician,
              profile_picture: p.profile_picture,
            }));
            setPatients(normalized);
            setLoading(false);
            return;
          }
        } catch {}
        const p = await fetchPatientMe();
        if (p?.patient?.id) {
          setRole("patient");
          setPatientMe(p.patient);
          const mine = await getMealPlansMine();
          setPlans(mine);
        }
      } catch {
        setToast({ type: "error", msg: "Failed to load data." });
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      if (role !== "dietitian" || !selectedPatientId) return;
      const list = await getMealPlansForPatient(selectedPatientId);
      setPlans(list);
    };
    void fetchPlans();
  }, [role, selectedPatientId]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const canCreate =
    role === "dietitian" && !!selectedPatientId && !!meDietitian?.id;

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

  if (!role) {
    return (
      <Box px={{ xs: 2, md: 6 }} py={4}>
        <Alert severity="error">Could not determine user role.</Alert>
      </Box>
    );
  }

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        My Meal Plans
      </Typography>

      {role === "dietitian" ? (
        <>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Select a patient
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="flex-start"
          >
            <Card sx={{ minWidth: 300 }}>
              <CardContent>
                <TextField
                  label="Search patients"
                  placeholder="Type to filter…"
                  fullWidth
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    const filtered = patients
                      .filter((p) =>
                        `${p.first_name} ${p.last_name}`
                          .toLowerCase()
                          .includes(q)
                      )
                      .sort((a, b) => a.first_name.localeCompare(b.first_name));
                    setPatients(filtered);
                  }}
                  sx={{ mb: 2 }}
                />
                <List dense>
                  {patients.map((p) => (
                    <ListItem
                      key={p.id}
                      disablePadding
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemButton
                        selected={selectedPatientId === p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                      >
                        <ListItemText
                          primary={`${p.first_name} ${p.last_name}`}
                          secondary={`@${p.username}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {patients.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No patients found.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>

            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="h5" component="h2">
                  {selectedPatient
                    ? `${selectedPatient.first_name} ${selectedPatient.last_name}'s plans`
                    : "Plans"}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!selectedPatientId}
                  onClick={() => setCreatorOpen(true)}
                >
                  New meal plan
                </Button>
              </Stack>

              {selectedPatientId ? (
                plans.length ? (
                  <Grid container spacing={2}>
                    {plans.map((mp) => (
                      <Grid item xs={12} md={6} key={mp.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography
                              variant="h6"
                              component="h3"
                              fontWeight={700}
                            >
                              {mp.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {mp.created_at
                                ? new Date(mp.created_at).toLocaleString()
                                : ""}
                            </Typography>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                              Items
                            </Typography>
                            <List dense>
                              {mp.items.map((it, i) => (
                                <ListItem key={`${it.label}-${i}`}>
                                  <ListItemText
                                    primary={it.label}
                                    secondary={
                                      it.recipe_id
                                        ? `#${it.recipe_id}`
                                        : undefined
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                            {mp.note && (
                              <>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2">
                                  Note
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {mp.note}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No meal plans yet for this patient.
                  </Alert>
                )
              ) : (
                <Alert severity="info">
                  Select a patient to view their meal plans.
                </Alert>
              )}
            </Box>
          </Stack>

          <Dialog
            open={creatorOpen}
            onClose={() => setCreatorOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>Create meal plan</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                <TextField
                  label="Title"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Note to patient"
                  placeholder="Optional note or instructions"
                  multiline
                  minRows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <MealPlanBuilder
                  initialRows={5}
                  ownerId={meDietitian?.id}
                  onCancel={() => setCreatorOpen(false)}
                  onSave={async (rows: Array<{ items: MealPlanItem[] }>) => {
                    if (!selectedPatientId || !meDietitian) return;
                    if (!planTitle.trim()) {
                      setToast({ type: "error", msg: "Title is required." });
                      return;
                    }
                    const items: MealPlanItem[] = rows.flatMap((r) =>
                      r.items.map((i) => ({ ...i }))
                    );
                    if (!items.length) {
                      setToast({
                        type: "error",
                        msg: "Add at least one item.",
                      });
                      return;
                    }
                    const created = await createMealPlan({
                      patient: selectedPatientId,
                      dietician: meDietitian.id,
                      title: planTitle.trim(),
                      items,
                      note: note.trim() || undefined,
                    });
                    if (created) {
                      setPlans((prev) => [created, ...prev]);
                      setToast({ type: "success", msg: "Meal plan saved." });
                      setCreatorOpen(false);
                      setPlanTitle("");
                      setNote("");
                    } else {
                      setToast({
                        type: "error",
                        msg: "Failed to save meal plan.",
                      });
                    }
                  }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreatorOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            Your plans
          </Typography>
          {plans.length ? (
            <Grid container spacing={2}>
              {plans.map((mp) => (
                <Grid item xs={12} md={6} key={mp.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3" fontWeight={700}>
                        {mp.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mp.created_at
                          ? new Date(mp.created_at).toLocaleString()
                          : ""}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Items
                      </Typography>
                      <List dense>
                        {mp.items.map((it, i) => (
                          <ListItem key={`${it.label}-${i}`}>
                            <ListItemText
                              primary={it.label}
                              secondary={
                                it.recipe_id ? `#${it.recipe_id}` : undefined
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                      {mp.note && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle2">
                            Note from your dietitian
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {mp.note}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">You don’t have any meal plans yet.</Alert>
          )}
        </>
      )}

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

export default MealPlansPage;
