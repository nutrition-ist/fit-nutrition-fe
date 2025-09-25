"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";

type MetricKey =
  | "weightKg"
  | "bmi"
  | "armCm"
  | "waistCm"
  | "chestCm"
  | "thighCm"
  | "hipsCm";

type Row = {
  date?: string;
  weightKg?: number;
  bmi?: number;
  armCm?: number;
  waistCm?: number;
  chestCm?: number;
  thighCm?: number;
  hipsCm?: number;
};

export interface MeasurementsChartProps {
  entries?: Row[];
  yKey?: MetricKey;
  height?: number;
}

const LABELS: Record<MetricKey, string> = {
  weightKg: "Weight",
  bmi: "BMI",
  armCm: "Arm",
  waistCm: "Waist",
  chestCm: "Chest",
  thighCm: "Thigh",
  hipsCm: "Hips",
};

function extract(entries: Row[] | undefined, key: MetricKey) {
  const list = Array.isArray(entries) ? entries : [];
  return list
    .map((e) => {
      const d = e?.date ? new Date(e.date) : null;
      const v = e?.[key];
      if (!d || Number.isNaN(d.getTime()) || typeof v !== "number") return null;
      return { y: v, date: d };
    })
    .filter((p): p is { y: number; date: Date } => p !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const YRANGE: Partial<Record<MetricKey, [number, number]>> = {
  bmi: [0, 50],
};

const DEFAULT_RANGE: [number, number] = [20, 120];

const MeasurementsChart: React.FC<MeasurementsChartProps> = ({
  entries,
  yKey = "weightKg",
  height = 320,
}) => {
  const [metric, setMetric] = useState<MetricKey>(yKey);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(640);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((els) => {
      const w = els[0]?.contentRect?.width;
      if (typeof w === "number") setWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const series = useMemo(() => extract(entries, metric), [entries, metric]);

  const padL = 36;
  const padB = 30;
  const padT = 16;
  const padR = 12;
  const plotW = Math.max(1, width - padL - padR);
  const plotH = Math.max(1, height - padT - padB);

  const xScale = (d: Date) => {
    const m = d.getMonth();
    const day = d.getDate();
    const days = new Date(d.getFullYear(), m + 1, 0).getDate();
    const pos = m + (day - 1) / days;
    return padL + (plotW * pos) / 11;
  };

  const [yMin, yMax] = YRANGE[metric] ?? DEFAULT_RANGE;
  const yScale = (v: number) =>
    padT + plotH - (plotH * (v - yMin)) / (yMax - yMin);

  const pathD = useMemo(() => {
    if (!series.length) return "";
    const pts = series.map(
      (p) => `${xScale(p.date)},${yScale(Math.max(yMin, Math.min(yMax, p.y)))}`
    );
    return `M${pts.join(" L")}`;
  }, [series, plotW, plotH, yMin, yMax]);

  const tickStep = metric === "bmi" ? 5 : 10;
  const yTicks = Array.from(
    { length: Math.floor((yMax - yMin) / tickStep) + 1 },
    (_, i) => yMin + i * tickStep
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        mb={1}
      >
        <Typography variant="h6">{LABELS[metric]}</Typography>
        <ToggleButtonGroup
          size="small"
          color="primary"
          exclusive
          value={metric}
          onChange={(_, v) => v && setMetric(v as MetricKey)}
        >
          <ToggleButton value="weightKg">Weight</ToggleButton>
          <ToggleButton value="bmi">BMI</ToggleButton>
          <ToggleButton value="waistCm">Waist</ToggleButton>
          <ToggleButton value="hipsCm">Hips</ToggleButton>
          <ToggleButton value="chestCm">Chest</ToggleButton>
          <ToggleButton value="armCm">Arm</ToggleButton>
          <ToggleButton value="thighCm">Thigh</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box ref={containerRef}>
        {!series.length ? (
          <Box
            sx={{
              height,
              display: "grid",
              placeItems: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">No measurements yet.</Typography>
          </Box>
        ) : (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label="Measurements chart"
          >
            {yTicks.map((t) => {
              const y = yScale(t);
              return (
                <g key={t}>
                  <line
                    x1={padL}
                    x2={padL + plotW}
                    y1={y}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                  <text x={8} y={y + 3} fontSize={11} fill="#6b7280">
                    {t}
                  </text>
                </g>
              );
            })}
            {months.map((m, i) => {
              const x = padL + (plotW * i) / 11;
              return (
                <g key={m}>
                  <line
                    x1={x}
                    x2={x}
                    y1={padT}
                    y2={padT + plotH}
                    stroke="#f1f5f9"
                  />
                  <text
                    x={x}
                    y={padT + plotH + 18}
                    fontSize={11}
                    fill="#6b7280"
                    textAnchor="middle"
                  >
                    {m}
                  </text>
                </g>
              );
            })}
            <line
              x1={padL}
              y1={padT}
              x2={padL}
              y2={padT + plotH}
              stroke="#9ca3af"
            />
            <line
              x1={padL}
              y1={padT + plotH}
              x2={padL + plotW}
              y2={padT + plotH}
              stroke="#9ca3af"
            />
            <path d={pathD} fill="none" stroke="#16a34a" strokeWidth={2} />
            {series.map((p, i) => (
              <circle
                key={i}
                cx={xScale(p.date)}
                cy={yScale(Math.max(yMin, Math.min(yMax, p.y)))}
                r={3}
                fill="#16a34a"
              />
            ))}
          </svg>
        )}
      </Box>
    </Paper>
  );
};

export default MeasurementsChart;
