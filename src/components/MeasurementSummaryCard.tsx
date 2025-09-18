"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import MeasurementsChart from "./MeasurementsChart";

type Entry = {
  timestamp: string;
  heightCm?: number;
  weightKg?: number;
  armCm?: number;
  waistCm?: number;
  chestCm?: number;
  thighCm?: number;
  hipsCm?: number;
  bmi?: number;
};

export interface MeasurementSummaryCardProps {
  hideButton?: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

type ApiMeasurement = {
  timestamp?: string;
  created_at?: string;
  height_cm?: number;
  weight_kg?: number;
  arm_cm?: number;
  waist_cm?: number;
  chest_cm?: number;
  thigh_cm?: number;
  hips_cm?: number;
  bmi?: number;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isApiMeasurement = (v: unknown): v is ApiMeasurement =>
  isObject(v) &&
  (typeof v.timestamp === "string" ||
    typeof v.created_at === "string" ||
    "weight_kg" in v ||
    "height_cm" in v);

const LOCAL_KEYS = [
  "measure_history_v1",
  "fn_measurements",
  "fit_measurements",
  "measurements_history",
];
const readLocalHistory = (): Entry[] => {
  try {
    const raw =
      LOCAL_KEYS.map((k) => localStorage.getItem(k)).find((v) => !!v) ?? "[]";
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const toEntry = (e: unknown): Entry | null => {
      if (typeof e !== "object" || e === null) return null;
      const o = e as Record<string, unknown>;
      const ts =
        (typeof o.timestamp === "string" && o.timestamp) ||
        (typeof o.date === "string" && o.date);
      if (!ts) return null;

      const num = (v: unknown) => (typeof v === "number" ? v : undefined);

      return {
        timestamp: ts,
        heightCm: num(o.heightCm),
        weightKg: num(o.weightKg),
        armCm: num(o.armCm),
        waistCm: num(o.waistCm),
        chestCm: num(o.chestCm),
        thighCm: num(o.thighCm),
        hipsCm: num(o.hipsCm),
        bmi: num(o.bmi),
      };
    };

    return parsed
      .map(toEntry)
      .filter((x): x is Entry => !!x)
      .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  } catch {
    return [];
  }
};

const latestOf = (hist: Entry[]): Entry | null =>
  hist.length
    ? hist
        .slice()
        .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))[0]
    : null;

const bmiOf = (e: Entry | null): number | null => {
  if (!e) return null;
  if (typeof e.bmi === "number") return e.bmi;
  const h = e.heightCm ?? 0;
  const w = e.weightKg ?? 0;
  if (!h || !w) return null;
  const m = h / 100;
  return Math.round((w / (m * m)) * 10) / 10;
};

const MeasurementSummaryCard: React.FC<MeasurementSummaryCardProps> = ({
  hideButton,
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const resp = await fetch(`${API_BASE}patient/measurements/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
              const data = (await resp.json()) as unknown;
              if (Array.isArray(data)) {
                const mapped = data.filter(isApiMeasurement).map((d) => ({
                  timestamp:
                    d.timestamp ?? d.created_at ?? new Date().toISOString(),
                  heightCm:
                    typeof d.height_cm === "number" ? d.height_cm : undefined,
                  weightKg:
                    typeof d.weight_kg === "number" ? d.weight_kg : undefined,
                  armCm: typeof d.arm_cm === "number" ? d.arm_cm : undefined,
                  waistCm:
                    typeof d.waist_cm === "number" ? d.waist_cm : undefined,
                  chestCm:
                    typeof d.chest_cm === "number" ? d.chest_cm : undefined,
                  thighCm:
                    typeof d.thigh_cm === "number" ? d.thigh_cm : undefined,
                  hipsCm: typeof d.hips_cm === "number" ? d.hips_cm : undefined,
                  bmi: typeof d.bmi === "number" ? d.bmi : undefined,
                })) as Entry[];
                setEntries(mapped);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }
        setEntries(readLocalHistory());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latest = useMemo(() => latestOf(entries), [entries]);

  const weightEntries = useMemo(
    () => entries.map((e) => ({ date: e.timestamp, weightKg: e.weightKg })),
    [entries]
  );

  const bmi = useMemo(() => bmiOf(latest), [latest]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          My Measurements
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MeasurementsChart
              entries={weightEntries}
              yKey="weightKg"
              height={220}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {loading ? (
              <Typography variant="body2" color="text.secondary">
                Loading…
              </Typography>
            ) : latest ? (
              <Stack spacing={1}>
                <Row label="Weight" value={latest.weightKg} unit="kg" />
                <Row label="BMI" value={bmi} />
                <Row label="Arm" value={latest.armCm} unit="cm" />
                <Row label="Waist" value={latest.waistCm} unit="cm" />
                <Row label="Chest" value={latest.chestCm} unit="cm" />
                <Row label="Thigh" value={latest.thighCm} unit="cm" />
                <Row label="Hips" value={latest.hipsCm} unit="cm" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Last saved: {new Date(latest.timestamp).toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No measurements saved yet.
              </Typography>
            )}

            {!hideButton && (
              <Box sx={{ mt: 2 }}>
                <Link href="/measurements">
                  <Button variant="contained" fullWidth>
                    Open my measurements
                  </Button>
                </Link>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Row: React.FC<{
  label: string;
  value: number | null | undefined;
  unit?: string;
}> = ({ label, value, unit = "" }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ width: 72 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Chip
      size="small"
      label={typeof value === "number" ? `${value}${unit}` : "–"}
      color="success"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  </Stack>
);

export default MeasurementSummaryCard;
