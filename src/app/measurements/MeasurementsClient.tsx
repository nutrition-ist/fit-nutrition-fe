"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, Grid, Stack, Typography, Divider, Paper } from "@mui/material";
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
        <div>
          <Typography variant="h4" fontWeight={700}>
            My Measurements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter your measurements on the right and click "Save measurements".
            The chart updates automatically and shows recent values with dates on the X axis.
          </Typography>
        </div>

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

          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Chart notes — how to read & use the measurements chart
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              This chart plots your measurements over time. The X axis shows the date of each entry (DD/MM/YY). The Y axis shows the selected metric (Weight, BMI, Waist, etc.).
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Default Y ranges are applied per metric to give a sensible baseline (for example: weight 35–135 kg, BMI 18–35). These are minimum ranges only — the chart will expand automatically if your recorded values fall outside the defaults so no data is clipped.
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Single-value behaviour: if there is only one recorded point the chart adds a small time padding (±7 days) so the point is centred and you can see it in context. When multiple points exist they are spaced according to their real dates so time intervals are represented accurately.
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Tick placement and labels: the chart draws a small set of X ticks (approx. 4) spaced evenly across the time range and labels them using DD/MM/YY. Y ticks are rounded to sensible integer values.
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Measurement guidance — how to add consistent readings:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Weight (kg): weigh at the same time of day when possible (e.g. morning, after using the bathroom) wearing similar clothing or none for consistency.</Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Height (cm): measure once (adult height rarely changes) and save — height is used to compute BMI.</Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Waist / Hips / Chest / Arm / Thigh (cm): use a soft tape, measure at the same anatomical point each time, pull tape snug but not compressing the skin. Record values to one decimal place if possible.</Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Edge cases & notes:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Missing fields: you can save entries that only include some measurements — the chart for each metric ignores entries without a numeric value for that metric.
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Units: all lengths use cm and weight uses kg. Do not mix units — convert before saving.</Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Precision: the UI accepts decimal inputs (e.g. 82.4 kg) but rounds some chart tick labels to integers for clarity.</Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ pl: 2 }}>• Storage: measurements are stored locally in your browser (localStorage). Clearing browser storage or switching devices will remove entries.</Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Interpreting deltas: The measurements panel shows two change indicators beside each metric — the first compares your most recent entry to the previous entry, the second compares the most recent to the earliest recorded value (for that metric). Colours indicate whether a change is generally positive or negative (e.g. weight down typically marked as good).
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              If you want any of these defaults adjusted (for example a different weight range), tell me which metric and preferred min/max and I can update it.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <MyMeasurements onSaved={() => refresh()} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MeasurementsPage;
