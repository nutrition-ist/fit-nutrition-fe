"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";

type Entry = {
  date: string;
  weightKg?: number;
  bmi?: number;
  armCm?: number;
  waistCm?: number;
  chestCm?: number;
  thighCm?: number;
  hipsCm?: number;
};

const STORAGE_KEY = "measure_history_v1";

const Row: React.FC<{
  k: string;
  v?: number;
  u: string;
  t: "up" | "down" | "dot";
}> = ({ k, v, u, t }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "78px 1fr auto",
      columnGap: 0.75,
      alignItems: "center",
      lineHeight: 1.15,
      py: 0.25,
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontSize: 13.5,
        fontWeight: 600,
        color: "text.secondary",
        whiteSpace: "nowrap",
      }}
    >
      {k}
    </Typography>
    <Box />
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography
        variant="body2"
        sx={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}
      >
        {typeof v === "number" ? `${v}${u ? ` ${u}` : ""}` : "–"}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: 13.5, fontWeight: 700, color: "text.disabled" }}
      >
        {t === "up" ? "↑" : t === "down" ? "↓" : "•"}
      </Typography>
    </Stack>
  </Box>
);

const trend = (a?: number, b?: number): "up" | "down" | "dot" => {
  if (typeof a !== "number" || typeof b !== "number") return "dot";
  if (a > b) return "up";
  if (a < b) return "down";
  return "dot";
};

const MeasurementHistory: React.FC = () => {
  const [history, setHistory] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Entry[]) : [];
      setHistory(Array.isArray(list) ? list : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const last = history.slice(0, 5);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 1,
      }}
    >
      {last.map((e, i) => {
        const prev = last[i + 1];
        return (
          <Card
            key={e.date}
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 2,
              boxShadow: 0,
              borderColor: alpha(theme.palette.primary.main, 0.12),
              bgcolor: alpha(theme.palette.success.main, 0.5),
            })}
          >
            <CardContent sx={{ p: 1.25 }}>
              <Box
                sx={(theme) => ({
                  display: "inline-block",
                  px: 1,
                  py: 0.5,
                  mb: 0.75,
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 800,
                  fontSize: 13.5,
                  lineHeight: 1,
                })}
              >
                {new Date(e.date).toLocaleDateString()}
              </Box>

              <Stack spacing={0}>
                <Row
                  k="Weight"
                  v={e.weightKg}
                  u="kg"
                  t={trend(e.weightKg, prev?.weightKg)}
                />
                <Row k="BMI" v={e.bmi} u="" t="dot" />
                <Row
                  k="Waist"
                  v={e.waistCm}
                  u="cm"
                  t={trend(e.waistCm, prev?.waistCm)}
                />
                <Row
                  k="Chest"
                  v={e.chestCm}
                  u="cm"
                  t={trend(e.chestCm, prev?.chestCm)}
                />
                <Row
                  k="Arm"
                  v={e.armCm}
                  u="cm"
                  t={trend(e.armCm, prev?.armCm)}
                />
                <Row
                  k="Hips"
                  v={e.hipsCm}
                  u="cm"
                  t={trend(e.hipsCm, prev?.hipsCm)}
                />
                <Row
                  k="Thigh"
                  v={e.thighCm}
                  u="cm"
                  t={trend(e.thighCm, prev?.thighCm)}
                />
              </Stack>
            </CardContent>
          </Card>
        );
      })}
      {last.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No measurements saved yet.
        </Typography>
      )}
    </Box>
  );
};

export default MeasurementHistory;
