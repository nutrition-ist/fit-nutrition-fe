"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Image from "next/image";
import MeasurementsChart from "@/components/MeasurementsChart";
import MyMeasurements from "@/components/MyMeasurements";
import MeasurementHistory from "@/components/MeasurementHistory";

export type UnitSystem = "metric" | "imperial";

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

const LOCAL_KEYS = [
  "measure_history_v1",
  "fn_measurements",
  "fit_measurements",
  "measurements_history",
];

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const asNum = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;

function fromUnknown(it: unknown): MeasurementEntry | null {
  if (!isRecord(it)) return null;
  const o = it as Partial<MeasurementEntry> & Record<string, unknown>;
  const date =
    (typeof o.date === "string" && o.date) ||
    (typeof o.timestamp === "string" && (o.timestamp as string)) ||
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
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    setEntries(readMeasurements());
  }, []);

  const latest = entries[entries.length - 1];
  const currentBmi = useMemo(() => latest?.bmi ?? null, [latest?.bmi]);

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h3" component="h1" fontWeight={800}>
          Measurements
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            href="/patient-dashboard"
            component="a"
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon />}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <MeasurementsChart entries={entries} yKey="weightKg" height={380} />
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <ToggleButtonGroup
              size="small"
              color="primary"
              exclusive
              value={units}
              onChange={(_, v) => v && setUnits(v as UnitSystem)}
            >
              <ToggleButton value="imperial">Imperial</ToggleButton>
              <ToggleButton value="metric">Metric</ToggleButton>
            </ToggleButtonGroup>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                onClick={() => setTutorialOpen(true)}
                sx={{ textTransform: "none" }}
              >
                How to take measurements
              </Button>
              <Typography variant="body2">
                Current BMI: {typeof currentBmi === "number" ? currentBmi : "—"}
              </Typography>
            </Stack>
          </Stack>
          <MyMeasurements unitSystem={units} />
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 1 }}>
        Measurement History
      </Typography>
      <MeasurementHistory />

      <Dialog
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <Image
            src="/images/measurements.png"
            alt="Measurement tutorial"
            width={1600}
            height={1000}
            style={{ width: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MeasurementsPage;
