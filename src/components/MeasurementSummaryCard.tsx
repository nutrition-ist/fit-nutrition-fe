"use client";
//7 gun sonra sil bu component'ı, şimdi yapılanlar kötü olursa kafana sıkma sonra. 
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import MeasurementsChart from "./MeasurementsChart";
import MeasurementHistory from "./MeasurementHistory";

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
    const parsed = JSON.parse(raw) as unknown[];
    const toEntry = (e: unknown): Entry | null => {
      if (!isObject(e)) return null;
      const ts =
        (typeof e.timestamp === "string" && e.timestamp) ||
        (typeof e.date === "string" && e.date);
      if (!ts) return null;
      const num = (v: unknown) => (typeof v === "number" ? v : undefined);
      return {
        timestamp: ts,
        heightCm: num(e.heightCm),
        weightKg: num(e.weightKg),
        armCm: num(e.armCm),
        waistCm: num(e.waistCm),
        chestCm: num(e.chestCm),
        thighCm: num(e.thighCm),
        hipsCm: num(e.hipsCm),
        bmi: num(e.bmi),
      };
    };
    return Array.isArray(parsed)
      ? parsed
          .map(toEntry)
          .filter((x): x is Entry => !!x)
          .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
      : [];
  } catch {
    return [];
  }
};

const MeasurementSummaryCard: React.FC<MeasurementSummaryCardProps> = ({
  hideButton,
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);

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
              const data = (await resp.json()) as unknown[];
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
                return;
              }
            }
          } catch {}
        }
        setEntries(readLocalHistory());
      } catch {
        setEntries(readLocalHistory());
      }
    })();
  }, []);

  const weightEntries = useMemo(
    () => entries.map((e) => ({ date: e.timestamp, weightKg: e.weightKg })),
    [entries]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">Your Measurements</Typography>
          {!hideButton && (
            <Link href="/measurements">
              <Button
                variant="contained"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Add Measurements
              </Button>
            </Link>
          )}
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MeasurementsChart
              entries={weightEntries}
              yKey="weightKg"
              height={220}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Last Measurements
            </Typography>
            <MeasurementHistory maxItems={2} minCardWidth={200} bold />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MeasurementSummaryCard;
