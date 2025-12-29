"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, Grid, Stack, Typography, Divider } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshIcon from "@mui/icons-material/Refresh";

import MeasurementsChart from "@/components/MeasurementsChart";
import MyMeasurements from "@/components/MyMeasurements";

const LOCAL_KEYS = [
  "measure_history_v1",
  "fn_measurements",
  "fit_measurements",
  "measurements_history",
];

export type MeasurementEntry = {
  date: string;
  weightKg?: number;
  bmi?: number;
  armCm?: number;
  waistCm?: number;
  chestCm?: number;
  thighCm?: number;
  hipsCm?: number;
};


type LegacySnake = {
  timestamp?: string;
  date?: string;
  weight_kg?: number;
  arm_cm?: number;
  waist_cm?: number;
  chest_cm?: number;
  thigh_cm?: number;
  hips_cm?: number;
  bmi?: number;
};


const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;


const asNum = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;


function fromUnknown(it: unknown): MeasurementEntry | null {
  if (!isRecord(it)) return null;
  const o = it as Partial<MeasurementEntry> & LegacySnake;

  const date =
    (typeof o.date === "string" && o.date) ||
    (typeof o.timestamp === "string" && o.timestamp) ||
    new Date().toISOString();

  return {
    date,
    weightKg: asNum(o.weightKg ?? o.weight_kg),
    bmi: asNum(o.bmi),
    armCm: asNum(o.armCm ?? o.arm_cm),
    waistCm: asNum(o.waistCm ?? o.waist_cm),
    chestCm: asNum(o.chestCm ?? o.chest_cm),
    thighCm: asNum(o.thighCm ?? o.thigh_cm),
    hipsCm: asNum(o.hipsCm ?? o.hips_cm),
  };
}


function readMeasurements(): MeasurementEntry[] {
  try {
    const raw =
      LOCAL_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ?? "[]";

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(fromUnknown)
      .filter((x): x is MeasurementEntry => !!x)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [];
  }
}

const MeasurementsPage: React.FC = () => {
  const [entries, setEntries] = useState<MeasurementEntry[]>([]);

  const refresh = (): void => setEntries(readMeasurements());

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h4" fontWeight={700}>
          My Measurements
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            component={Link}
            href="/patient-dashboard"
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon />}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <MeasurementsChart entries={entries} yKey="weightKg" height={380} />
        </Grid>

        <Grid item xs={12} md={5}>
          <MyMeasurements />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MeasurementsPage;
