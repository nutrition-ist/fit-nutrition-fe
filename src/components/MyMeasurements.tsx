"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type NumOrEmpty = number | "";

export interface MeasurementsEntry {
  date: string;
  heightCm?: number;
  weightKg?: number;
  armCm?: number;
  waistCm?: number;
  chestCm?: number;
  thighCm?: number;
  hipsCm?: number;
  bmi?: number;
}

export interface MyMeasurementsProps {
  onSaved?: (entry: MeasurementsEntry) => void;
}

const STORAGE_KEY = "measure_history_v1";
const HEIGHT_KEY = "bmi_height_cm";

const round1 = (n: number) => Math.round(n * 10) / 10;

const calcBmi = (hCm?: number, wKg?: number): number | null => {
  if (!hCm || !wKg) return null;
  const m = hCm / 100;
  if (!m) return null;
  return round1(wKg / (m * m));
};

const loadHistory = (): MeasurementsEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MeasurementsEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveHistory = (list: MeasurementsEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

const MyMeasurements: React.FC<MyMeasurementsProps> = ({ onSaved }) => {
  const [heightCm, setHeightCm] = useState<NumOrEmpty>("");
  const [weightKg, setWeightKg] = useState<NumOrEmpty>("");
  const [armCm, setArmCm] = useState<NumOrEmpty>("");
  const [waistCm, setWaistCm] = useState<NumOrEmpty>("");
  const [chestCm, setChestCm] = useState<NumOrEmpty>("");
  const [thighCm, setThighCm] = useState<NumOrEmpty>("");
  const [hipsCm, setHipsCm] = useState<NumOrEmpty>("");

  const [history, setHistory] = useState<MeasurementsEntry[]>([]);

  useEffect(() => {
    const h = localStorage.getItem(HEIGHT_KEY);
    if (h) setHeightCm(Number(h));
    setHistory(loadHistory());
  }, []);

  const latest = history[0];

  const bmi = useMemo(() => {
    const h = typeof heightCm === "number" ? heightCm : latest?.heightCm;
    const w = typeof weightKg === "number" ? weightKg : latest?.weightKg;
    return calcBmi(h, w);
  }, [heightCm, weightKg, latest?.heightCm, latest?.weightKg]);

  const handleSave = () => {
    const entry: MeasurementsEntry = {
      date: new Date().toISOString(),
      heightCm: typeof heightCm === "number" ? heightCm : latest?.heightCm,
      weightKg: typeof weightKg === "number" ? weightKg : undefined,
      armCm: typeof armCm === "number" ? armCm : undefined,
      waistCm: typeof waistCm === "number" ? waistCm : undefined,
      chestCm: typeof chestCm === "number" ? chestCm : undefined,
      thighCm: typeof thighCm === "number" ? thighCm : undefined,
      hipsCm: typeof hipsCm === "number" ? hipsCm : undefined,
    };
    if (entry.heightCm) localStorage.setItem(HEIGHT_KEY, String(entry.heightCm));
    const computedBmi = calcBmi(entry.heightCm, entry.weightKg ?? latest?.weightKg);
    if (computedBmi !== null) entry.bmi = computedBmi;

    const next = [entry, ...history].slice(0, 50);
    setHistory(next);
    saveHistory(next);
    onSaved?.(entry);

    setWeightKg("");
    setArmCm("");
    setWaistCm("");
    setChestCm("");
    setThighCm("");
    setHipsCm("");
  };

  const delta = (field: keyof MeasurementsEntry) => {
    if (history.length < 2) return null;
    const a = history[0]?.[field];
    const b = history[1]?.[field];
    if (typeof a !== "number" || typeof b !== "number") return null;
    return round1(a - b);
  };

  const oldestValue = (field: keyof MeasurementsEntry): number | null => {
    for (let i = history.length - 1; i >= 0; i--) {
      const v = history[i]?.[field];
      if (typeof v === "number") return v;
    }
    return null;
  };

  const colorForDelta = (d: number, field: keyof MeasurementsEntry): "default" | "success" | "warning" => {
    const goodIfDown = field !== "armCm" && field !== "chestCm";
    if (d === 0) return "default";
    if (d < 0) return goodIfDown ? "success" : "warning";
    return goodIfDown ? "warning" : "success";
  };

  const DeltaChip: React.FC<{ field: keyof MeasurementsEntry }> = ({ field }) => {
    const d = delta(field);
    if (d === null) return null;
    const color = colorForDelta(d, field);
    const sign = d > 0 ? "+" : d < 0 ? "–" : "±";
    const unit = field === "weightKg" ? " kg" : field === "bmi" ? "" : " cm";
    return <Chip size="small" color={color} label={`${sign}${Math.abs(d)}${unit}`} />;
  };

  const DeltaFromFirst: React.FC<{ field: keyof MeasurementsEntry }> = ({ field }) => {
    const latestV = latest?.[field];
    const firstV = oldestValue(field);
    if (typeof latestV !== "number" || typeof firstV !== "number") return null;
    const d = round1(latestV - firstV);
    const color = colorForDelta(d, field);
    const sign = d > 0 ? "+" : d < 0 ? "–" : "±";
    const unit = field === "weightKg" ? " kg" : field === "bmi" ? "" : " cm";
    return (
      <Chip
        size="small"
        color={color}
        label={`${sign}${Math.abs(d)}${unit} vs first`}
        sx={{ ml: 0.5 }}
      />
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          My Measurements
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Height (cm)"
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 80, max: 250, step: 1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 20, max: 300, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Arm (cm)"
                    type="number"
                    value={armCm}
                    onChange={(e) => setArmCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 5, max: 80, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Waist (cm)"
                    type="number"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 30, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Chest (cm)"
                    type="number"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 30, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Thigh (cm)"
                    type="number"
                    value={thighCm}
                    onChange={(e) => setThighCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 20, max: 120, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Hips (cm)"
                    type="number"
                    value={hipsCm}
                    onChange={(e) => setHipsCm(e.target.value === "" ? "" : Number(e.target.value))}
                    inputProps={{ min: 30, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" onClick={handleSave}>
                  Save measurements
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {bmi !== null ? `BMI: ${bmi}` : "BMI will show after height & weight"}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Latest
              </Typography>
              <Stack spacing={1} mt={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Weight</Typography>
                  <Chip label={latest?.weightKg ? `${latest.weightKg} kg` : "—"} size="small" />
                  <DeltaChip field="weightKg" />
                  <DeltaFromFirst field="weightKg" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>BMI</Typography>
                  <Chip label={latest?.bmi ?? bmi ?? "—"} size="small" />
                  <DeltaChip field="bmi" />
                  <DeltaFromFirst field="bmi" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Arm</Typography>
                  <Chip label={latest?.armCm ?? "—"} size="small" />
                  <DeltaChip field="armCm" />
                  <DeltaFromFirst field="armCm" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Waist</Typography>
                  <Chip label={latest?.waistCm ?? "—"} size="small" />
                  <DeltaChip field="waistCm" />
                  <DeltaFromFirst field="waistCm" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Chest</Typography>
                  <Chip label={latest?.chestCm ?? "—"} size="small" />
                  <DeltaChip field="chestCm" />
                  <DeltaFromFirst field="chestCm" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Thigh</Typography>
                  <Chip label={latest?.thighCm ?? "—"} size="small" />
                  <DeltaChip field="thighCm" />
                  <DeltaFromFirst field="thighCm" />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Hips</Typography>
                  <Chip label={latest?.hipsCm ?? "—"} size="small" />
                  <DeltaChip field="hipsCm" />
                  <DeltaFromFirst field="hipsCm" />
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {latest?.date ? `Last saved: ${new Date(latest.date).toLocaleString()}` : "No entries yet"}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="subtitle2" color="text.secondary">
                  History (last 7)
                </Typography>

                <List dense>
                  {history.slice(0, 7).map((e) => (
                    <ListItem key={e.date} disableGutters>
                      <ListItemText
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                        primary={`${new Date(e.date).toLocaleDateString('en-GB')} • ${e.weightKg ? `${e.weightKg} kg` : "—"}${e.bmi ? ` • BMI ${e.bmi}` : ""}`}
                        secondary={[
                          e.waistCm ? `Waist ${e.waistCm} cm` : null,
                          e.hipsCm ? `Hips ${e.hipsCm} cm` : null,
                          e.chestCm ? `Chest ${e.chestCm} cm` : null,
                          e.armCm ? `Arm ${e.armCm} cm` : null,
                          e.thighCm ? `Thigh ${e.thighCm} cm` : null,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      />
                    </ListItem>
                  ))}
                  {history.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No measurements saved yet.
                    </Typography>
                  )}
                </List>

              </Stack>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MyMeasurements;
