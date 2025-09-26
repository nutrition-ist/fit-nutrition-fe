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

export interface MeasurementHistoryProps {
  maxItems?: number;
  minCardWidth?: number;
  bold?: boolean;
}

const STORAGE_KEY = "measure_history_v1";

const Row: React.FC<{
  k: string;
  v?: number;
  u: string;
  t: "up" | "down" | "dot";
  bold: boolean;
}> = ({ k, v, u, t, bold }) => (
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
        fontWeight: bold ? 600 : 500,
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
        sx={{
          fontSize: 13.5,
          fontWeight: bold ? 700 : 600,
          whiteSpace: "nowrap",
        }}
      >
        {typeof v === "number" ? `${v}${u ? ` ${u}` : ""}` : "–"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: 13.5,
          fontWeight: bold ? 700 : 600,
          color: "text.disabled",
        }}
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

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  maxItems,
  minCardWidth = 200,
  bold = true,
}) => {
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

  const list =
    typeof maxItems === "number" ? history.slice(0, maxItems) : history;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        gap: 1,
      }}
    >
      {list.map((e, i) => {
        const prev = list[i + 1];
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
                  bold={bold}
                />
                <Row k="BMI" v={e.bmi} u="" t="dot" bold={bold} />
                <Row
                  k="Waist"
                  v={e.waistCm}
                  u="cm"
                  t={trend(e.waistCm, prev?.waistCm)}
                  bold={bold}
                />
                <Row
                  k="Chest"
                  v={e.chestCm}
                  u="cm"
                  t={trend(e.chestCm, prev?.chestCm)}
                  bold={bold}
                />
                <Row
                  k="Arm"
                  v={e.armCm}
                  u="cm"
                  t={trend(e.armCm, prev?.armCm)}
                  bold={bold}
                />
                <Row
                  k="Hips"
                  v={e.hipsCm}
                  u="cm"
                  t={trend(e.hipsCm, prev?.hipsCm)}
                  bold={bold}
                />
                <Row
                  k="Thigh"
                  v={e.thighCm}
                  u="cm"
                  t={trend(e.thighCm, prev?.thighCm)}
                  bold={bold}
                />
              </Stack>
            </CardContent>
          </Card>
        );
      })}
      {list.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No measurements saved yet.
        </Typography>
      )}
    </Box>
  );
};

export default MeasurementHistory;
