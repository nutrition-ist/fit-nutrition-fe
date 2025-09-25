"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { UnitSystem } from "@/app/measurements/page";

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
  unitSystem?: UnitSystem;
}

const STORAGE_KEY = "measure_history_v1";
const HEIGHT_KEY = "bmi_height_cm";
const round1 = (n: number) => Math.round(n * 10) / 10;

const kgToLb = (kg: number) => kg * 2.2046226218;
const lbToKg = (lb: number) => lb / 2.2046226218;
const cmToIn = (cm: number) => cm / 2.54;
const inToCm = (inch: number) => inch * 2.54;

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
  } catch {}
};

const MyMeasurements: React.FC<MyMeasurementsProps> = ({
  onSaved,
  unitSystem = "metric",
}) => {
  const [height, setHeight] = useState<NumOrEmpty>("");
  const [weight, setWeight] = useState<NumOrEmpty>("");
  const [arm, setArm] = useState<NumOrEmpty>("");
  const [waist, setWaist] = useState<NumOrEmpty>("");
  const [chest, setChest] = useState<NumOrEmpty>("");
  const [thigh, setThigh] = useState<NumOrEmpty>("");
  const [hips, setHips] = useState<NumOrEmpty>("");

  const [history, setHistory] = useState<MeasurementsEntry[]>([]);
  const latest = history[0];
  const prevUnitRef = useRef<UnitSystem>(unitSystem);

  useEffect(() => {
    const h = localStorage.getItem(HEIGHT_KEY);
    if (h) setHeight(Number(h));
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (typeof height !== "number") {
      prevUnitRef.current = unitSystem;
      return;
    }
    if (prevUnitRef.current !== unitSystem) {
      setHeight(unitSystem === "imperial" ? cmToIn(height) : inToCm(height));
      prevUnitRef.current = unitSystem;
    }
  }, [unitSystem, height]);

  const latestHeightCm =
    typeof height === "number"
      ? unitSystem === "metric"
        ? height
        : inToCm(height)
      : latest?.heightCm;
  const latestWeightKg =
    typeof weight === "number"
      ? unitSystem === "metric"
        ? weight
        : lbToKg(weight)
      : latest?.weightKg;

  const bmi = useMemo(
    () => calcBmi(latestHeightCm, latestWeightKg),
    [latestHeightCm, latestWeightKg]
  );

  const handleSave = () => {
    const entry: MeasurementsEntry = {
      date: new Date().toISOString(),
      heightCm:
        typeof height === "number"
          ? unitSystem === "metric"
            ? height
            : inToCm(height)
          : latest?.heightCm,
      weightKg:
        typeof weight === "number"
          ? unitSystem === "metric"
            ? weight
            : lbToKg(weight)
          : undefined,
      armCm:
        typeof arm === "number"
          ? unitSystem === "metric"
            ? arm
            : inToCm(arm)
          : undefined,
      waistCm:
        typeof waist === "number"
          ? unitSystem === "metric"
            ? waist
            : inToCm(waist)
          : undefined,
      chestCm:
        typeof chest === "number"
          ? unitSystem === "metric"
            ? chest
            : inToCm(chest)
          : undefined,
      thighCm:
        typeof thigh === "number"
          ? unitSystem === "metric"
            ? thigh
            : inToCm(thigh)
          : undefined,
      hipsCm:
        typeof hips === "number"
          ? unitSystem === "metric"
            ? hips
            : inToCm(hips)
          : undefined,
    };
    if (entry.heightCm)
      localStorage.setItem(HEIGHT_KEY, String(entry.heightCm));
    const computedBmi = calcBmi(
      entry.heightCm,
      entry.weightKg ?? latest?.weightKg
    );
    if (computedBmi !== null) entry.bmi = computedBmi;
    const next = [entry, ...history].slice(0, 50);
    setHistory(next);
    saveHistory(next);
    onSaved?.(entry);
    setWeight("");
    setArm("");
    setWaist("");
    setChest("");
    setThigh("");
    setHips("");
  };

  const fmt = (n: number | undefined, w: boolean) => {
    if (typeof n !== "number") return "–";
    if (w)
      return unitSystem === "metric"
        ? `${round1(n)} kg`
        : `${round1(kgToLb(n))} lb`;
    return unitSystem === "metric"
      ? `${round1(n)} cm`
      : `${round1(cmToIn(n))} in`;
  };

  const label = {
    height: unitSystem === "metric" ? "Height (cm)" : "Height (in)",
    weight: unitSystem === "metric" ? "Weight (kg)" : "Weight (lb)",
    arm: unitSystem === "metric" ? "Arm (cm)" : "Arm (in)",
    waist: unitSystem === "metric" ? "Waist (cm)" : "Waist (in)",
    chest: unitSystem === "metric" ? "Chest (cm)" : "Chest (in)",
    thigh: unitSystem === "metric" ? "Thigh (cm)" : "Thigh (in)",
    hips: unitSystem === "metric" ? "Hips (cm)" : "Hips (in)",
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Your Measurements
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label={label.height}
                    type="number"
                    value={height}
                    onChange={(e) =>
                      setHeight(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 80, max: 250, step: 1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={label.weight}
                    type="number"
                    value={weight}
                    onChange={(e) =>
                      setWeight(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 20, max: 660, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={label.arm}
                    type="number"
                    value={arm}
                    onChange={(e) =>
                      setArm(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 2, max: 80, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={label.waist}
                    type="number"
                    value={waist}
                    onChange={(e) =>
                      setWaist(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 10, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={label.chest}
                    type="number"
                    value={chest}
                    onChange={(e) =>
                      setChest(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 10, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={label.thigh}
                    type="number"
                    value={thigh}
                    onChange={(e) =>
                      setThigh(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 10, max: 140, step: 0.1 }}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label={label.hips}
                    type="number"
                    value={hips}
                    onChange={(e) =>
                      setHips(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    inputProps={{ min: 10, max: 200, step: 0.1 }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" onClick={handleSave}>
                  Save measurements
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {bmi !== null
                    ? `BMI: ${bmi}`
                    : "BMI will show after height & weight"}
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
                  <Chip label={fmt(latest?.weightKg, true)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>BMI</Typography>
                  <Chip label={latest?.bmi ?? "–"} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Arm</Typography>
                  <Chip label={fmt(latest?.armCm, false)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Waist</Typography>
                  <Chip label={fmt(latest?.waistCm, false)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Chest</Typography>
                  <Chip label={fmt(latest?.chestCm, false)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Thigh</Typography>
                  <Chip label={fmt(latest?.thighCm, false)} size="small" />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ minWidth: 120 }}>Hips</Typography>
                  <Chip label={fmt(latest?.hipsCm, false)} size="small" />
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MyMeasurements;
