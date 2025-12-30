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

type MeasurementEntry = {
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
  entries?: MeasurementEntry[];
  yKey?: MetricKey;
  height?: number;
}

/* Labels & units */
const LABELS: Record<MetricKey, string> = {
  weightKg: "Weight (kg)",
  bmi: "BMI",
  armCm: "Arm (cm)",
  waistCm: "Waist (cm)",
  chestCm: "Chest (cm)",
  thighCm: "Thigh (cm)",
  hipsCm: "Hips (cm)",
};
const UNITS: Record<MetricKey, string> = {
  weightKg: "kg",
  bmi: "",
  armCm: "cm",
  waistCm: "cm",
  chestCm: "cm",
  thighCm: "cm",
  hipsCm: "cm",
};

// minimum default ranges (these are minimums that can expand if data sits outside)
const BASE_RANGES: Record<MetricKey, [number, number]> = {
  weightKg: [35, 135],
  bmi: [18, 35],
  armCm: [10, 60],
  waistCm: [50, 150],
  chestCm: [60, 140],
  thighCm: [30, 80],
  hipsCm: [50, 150],
};

/* Helpers */
function extractSeries(
  entries: MeasurementEntry[] | undefined,
  key: MetricKey
): { x: number; y: number; date: Date }[] {
  const list = Array.isArray(entries) ? entries : [];
  return list
    .map((e) => {
      const d = e?.date ? new Date(e.date) : null;
      const v = e?.[key];
      if (!d || Number.isNaN(d.getTime()) || typeof v !== "number") return null;
      return { x: 0, y: v, date: d };
    })
    .filter((p): p is { x: number; y: number; date: Date } => p !== null);
}

function formatDateShort(d: Date) {
  // DD/MM/YY
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

/* Component */
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

  const series = useMemo(() => extractSeries(entries, metric), [entries, metric]);

  const ONE_DAY = 24 * 60 * 60 * 1000;

  const dataXMin = useMemo(
    () => (series.length ? Math.min(...series.map((p) => p.date.getTime())) : 0),
    [series]
  );
  const dataXMax = useMemo(
    () => (series.length ? Math.max(...series.map((p) => p.date.getTime())) : 1),
    [series]
  );
  const dataYMin = useMemo(() => (series.length ? Math.min(...series.map((p) => p.y)) : 0), [series]);
  const dataYMax = useMemo(() => (series.length ? Math.max(...series.map((p) => p.y)) : 1), [series]);

  // apply base ranges but allow expansion
  const base = BASE_RANGES[metric];
  const xMin = useMemo(() => {
    if (!series.length) return Date.now() - 7 * ONE_DAY;
    if (series.length === 1) return dataXMin - 7 * ONE_DAY;
    return dataXMin;
  }, [series.length, dataXMin]);
  const xMax = useMemo(() => {
    if (!series.length) return Date.now() + 7 * ONE_DAY;
    if (series.length === 1) return dataXMax + 7 * ONE_DAY;
    return dataXMax;
  }, [series.length, dataXMax]);

  const yMin = useMemo(() => {
    if (!series.length) return base ? base[0] : 0;
    return Math.min(base ? base[0] : dataYMin, dataYMin);
  }, [series.length, base, dataYMin]);
  const yMax = useMemo(() => {
    if (!series.length) return base ? base[1] : 1;
    return Math.max(base ? base[1] : dataYMax, dataYMax);
  }, [series.length, base, dataYMax]);

  const pad = 28;
  const plotW = Math.max(1, width - pad * 2);
  const plotH = Math.max(1, height - pad * 2);

  const pathD = useMemo(() => {
    if (!series.length) return "";
    const xScale = (t: number) => pad + (plotW * (t - xMin)) / (xMax - xMin || 1);
    const yScale = (v: number) => pad + plotH - (plotH * (v - yMin)) / (yMax - yMin || 1);
    const pts = series
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((p) => `${xScale(p.date.getTime())},${yScale(p.y)}`);
    return `M${pts.join(" L")}`;
  }, [series, plotW, plotH, xMin, xMax, yMin, yMax, pad]);

  // Y ticks: try to use integer ticks
  const ticks = 4;
  const ySpan = Math.max(1e-6, yMax - yMin);
  const rawStep = ySpan / ticks;
  const step = Math.max(1, Math.round(rawStep));
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + step * i).map((v) => v);

  // X ticks
  const xTicks = useMemo(() => {
    const tcount = 4;
    const span = xMax - xMin || ONE_DAY;
    return Array.from({ length: tcount + 1 }, (_, i) => Math.round(xMin + (span * i) / tcount));
  }, [xMin, xMax]);

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
            height={height + 24}
            role="img"
            aria-label="Measurements chart"
          >
            {/* Y gridlines and labels */}
            {yTicks.map((t, idx) => {
              const y = pad + plotH - (plotH * (t - yMin)) / (yMax - yMin || 1);
              return (
                <g key={`y-${idx}`}>
                  <line
                    x1={pad}
                    x2={pad + plotW}
                    y1={y}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                  <text x={4} y={y + 3} fontSize={11} fill="#6b7280">
                    {Math.round(t)} {UNITS[metric]}
                  </text>
                </g>
              );
            })}

            {/* axes */}
            <line x1={pad} y1={pad} x2={pad} y2={pad + plotH} stroke="#9ca3af" />
            <line
              x1={pad}
              y1={pad + plotH}
              x2={pad + plotW}
              y2={pad + plotH}
              stroke="#9ca3af"
            />

            {/* vertical x tick gridlines */}
            {xTicks.map((tx, i) => {
              const x = pad + (plotW * (tx - xMin)) / (xMax - xMin || 1);
              return (
                <g key={`x-${i}`}>
                  <line
                    x1={x}
                    x2={x}
                    y1={pad}
                    y2={pad + plotH}
                    stroke="#f3f4f6"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}

            {/* line */}
            <path d={pathD} fill="none" stroke="#16a34a" strokeWidth={2} />

            {/* points */}
            {series
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((p, i) => {
                const x = pad + (plotW * (p.date.getTime() - xMin)) / (xMax - xMin || 1);
                const y = pad + plotH - (plotH * (p.y - yMin)) / (yMax - yMin || 1);
                return <circle key={i} cx={x} cy={y} r={3} fill="#16a34a" />;
              })}

            {/* x labels */}
            {xTicks.map((tx, i) => {
              const x = pad + (plotW * (tx - xMin)) / (xMax - xMin || 1);
              return (
                <text
                  key={`xl-${i}`}
                  x={x}
                  y={pad + plotH + 16}
                  fontSize={11}
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {formatDateShort(new Date(tx))}
                </text>
              );
            })}
          </svg>
        )}
      </Box>
    </Paper>
  );
};

export default MeasurementsChart;
