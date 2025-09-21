"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MealPlanBuilder from "@/components/MealPlanBuilder";

type Role = "dietitian" | "patient";
type PlannerRow = import("@/components/MealPlanBuilder").PlanRow;

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

const patchMealPlan = async (
  id: number,
  payload: Partial<{
    title: string;
    items: { label: string; recipe_id?: number }[];
    note: string | null;
  }>
): Promise<MealPlan | null> => {
  try {
    const { data } = await axios.patch(
      `${apiBase}mealplan/update/${id}/`,
      payload,
      { headers: authHeaders() }
    );
    return data as MealPlan;
  } catch {
    return null;
  }
};

const deleteMealPlan = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${apiBase}mealplan/delete/${id}/`, {
      headers: authHeaders(),
    });
    return true;
  } catch {
    return false;
  }
};

type BuilderRow = {
  time: string;
  items: { label: string; recipe_id?: number }[];
};

const parseTimeFromLabel = (label: string) => {
  const m = /^(\d{2}:\d{2})\s+(.*)$/.exec(label.trim());
  if (m) return { time: m[1], text: m[2] };
  return { time: "00:00", text: label.trim() };
};

const itemsToRows = (items: MealPlanItem[]): BuilderRow[] => {
  const map = new Map<string, { label: string; recipe_id?: number }[]>();
  items.forEach((it) => {
    const { time, text } = parseTimeFromLabel(it.label);
    const arr = map.get(time) ?? [];
    arr.push({ label: text, recipe_id: it.recipe_id });
    map.set(time, arr);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([time, items]) => ({ time, items }));
};

const rowsToItems = (rows: BuilderRow[]): MealPlanItem[] =>
  rows.flatMap((row) =>
    row.items.map((it) => ({
      label: `${row.time} ${it.label}`.trim(),
      recipe_id: it.recipe_id,
    }))
  );

const groupItemsByTime = (items: MealPlanItem[]) => {
  const buckets = new Map<
    string,
    { time: string; entries: { label: string; recipe_id?: number }[] }
  >();
  for (const it of items) {
    const m = it.label.match(/^(\d{2}:\d{2})\s+(.*)$/);
    const time = m ? m[1] : "";
    const label = m ? m[2] : it.label;
    const key = time || "_";
    if (!buckets.has(key)) buckets.set(key, { time, entries: [] });
    buckets.get(key)!.entries.push({ label, recipe_id: it.recipe_id });
  }
  return Array.from(buckets.values()).sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
};

const MealPlansPage: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [meDietitian, setMeDietitian] = useState<Dietitian | null>(null);
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
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [planTitle, setPlanTitle] = useState("");
  const [note, setNote] = useState("");
  const [builderRows, setBuilderRows] = useState<BuilderRow[]>([]);

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

  const openCreate = () => {
    setEditingPlan(null);
    setPlanTitle("");
    setNote("");
    setBuilderRows([]);
    setCreatorOpen(true);
  };

  const openEdit = (mp: MealPlan) => {
    setEditingPlan(mp);
    setPlanTitle(mp.title);
    setNote(mp.note || "");
    setBuilderRows(itemsToRows(mp.items || []));
    setCreatorOpen(true);
  };

  const handleSaveFromBuilder = async (rows: BuilderRow[]) => {
    if (!canCreate || !meDietitian) return;
    if (!planTitle.trim()) {
      setToast({ type: "error", msg: "Title is required." });
      return;
    }

    if (editingPlan) {
      const items = rowsToItems(rows);
      const payload: Partial<{
        title: string;
        items: MealPlanItem[];
        note: string | null;
      }> = {
        title: planTitle.trim(),
        note: note.trim() || null,
      };
      if (items.length > 0) {
        payload.items = items;
      }
      const updated = await patchMealPlan(editingPlan.id, payload);
      if (updated) {
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setToast({ type: "success", msg: "Meal plan updated." });
        setCreatorOpen(false);
        setEditingPlan(null);
      } else {
        setToast({ type: "error", msg: "Failed to update meal plan." });
      }
      return;
    }

    const items = rowsToItems(rows);
    if (items.length === 0) {
      setToast({ type: "error", msg: "Add at least one item." });
      return;
    }
    const created = await createMealPlan({
      patient: selectedPatientId as number,
      dietician: meDietitian.id,
      title: planTitle.trim(),
      items,
      note: note.trim() || undefined,
    });
    if (created) {
      setPlans((prev) => [created, ...prev]);
      setToast({ type: "success", msg: "Meal plan saved." });
      setCreatorOpen(false);
    } else {
      setToast({ type: "error", msg: "Failed to save meal plan." });
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this meal plan?");
    if (!ok) return;
    const res = await deleteMealPlan(id);
    if (res) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setToast({ type: "success", msg: "Meal plan deleted." });
    } else {
      setToast({ type: "error", msg: "Failed to delete meal plan." });
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
                  InputProps={{
                    startAdornment: (
                      <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                    ),
                  }}
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    setPatients((prev) =>
                      prev.slice().sort((a, b) => {
                        const an =
                          `${a.first_name} ${a.last_name}`.toLowerCase();
                        const bn =
                          `${b.first_name} ${b.last_name}`.toLowerCase();
                        const am = an.includes(q) ? 0 : 1;
                        const bm = bn.includes(q) ? 0 : 1;
                        return am - bm || an.localeCompare(bn);
                      })
                    );
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
                  onClick={openCreate}
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
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="h6"
                                component="h3"
                                fontWeight={700}
                              >
                                {mp.title}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  aria-label="edit"
                                  size="small"
                                  onClick={() => openEdit(mp)}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  aria-label="delete"
                                  size="small"
                                  onClick={() => handleDelete(mp.id)}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>

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
            onClose={() => {
              setCreatorOpen(false);
              setEditingPlan(null);
            }}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              {editingPlan ? "Edit meal plan" : "Create meal plan"}
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ mb: 2 }}>
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
              </Stack>

              <MealPlanBuilder
                ownerId={meDietitian?.id}
                initialRows={5}
                initialData={builderRows.length ? builderRows : undefined}
                onSave={async (rows: PlannerRow[]) => {
                  setBuilderRows(rows as BuilderRow[]);
                  await handleSaveFromBuilder(rows as BuilderRow[]);
                }}
                onCancel={() => {
                  setCreatorOpen(false);
                  setEditingPlan(null);
                }}
              />
            </DialogContent>
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
                        {groupItemsByTime(mp.items).map((grp, idx) => (
                          <ListItem key={`grp-${idx}`} alignItems="flex-start">
                            <ListItemText
                              primary={grp.time || "—"}
                              secondary={
                                <span>
                                  {grp.entries.map((e, j) => (
                                    <React.Fragment key={`e-${j}`}>
                                      {e.recipe_id ? (
                                        <Link href={`/recipes/${e.recipe_id}`}>
                                          {e.label}
                                        </Link>
                                      ) : (
                                        e.label
                                      )}
                                      {j < grp.entries.length - 1 ? ", " : ""}
                                    </React.Fragment>
                                  ))}
                                </span>
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
