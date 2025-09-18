"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Button,
} from "@mui/material";

export interface BmiCardProps {
  onSaved?: (bmi: number) => void;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

const classify = (bmi: number): string => {
  if (!Number.isFinite(bmi)) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

const BmiCard: React.FC<BmiCardProps> = ({ onSaved }) => {
  const [heightCm, setHeightCm] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");

  // load previous values
  useEffect(() => {
    const h = localStorage.getItem("bmi_height_cm");
    const w = localStorage.getItem("bmi_weight_kg");
    if (h) setHeightCm(Number(h));
    if (w) setWeightKg(Number(w));
  }, []);

  const bmi = useMemo(() => {
    const h = typeof heightCm === "number" ? heightCm : NaN;
    const w = typeof weightKg === "number" ? weightKg : NaN;
    if (!h || !w) return NaN;
    const meters = h / 100;
    return round1(w / (meters * meters));
  }, [heightCm, weightKg]);

  const save = () => {
    if (typeof heightCm === "number")
      localStorage.setItem("bmi_height_cm", String(heightCm));
    if (typeof weightKg === "number")
      localStorage.setItem("bmi_weight_kg", String(weightKg));
    if (Number.isFinite(bmi)) onSaved?.(bmi);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          BMI
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={1}>
          <TextField
            label="Height (cm)"
            type="number"
            value={heightCm}
            onChange={(e) =>
              setHeightCm(e.target.value === "" ? "" : Number(e.target.value))
            }
            inputProps={{ min: 80, max: 250, step: 1 }}
            fullWidth
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={weightKg}
            onChange={(e) =>
              setWeightKg(e.target.value === "" ? "" : Number(e.target.value))
            }
            inputProps={{ min: 20, max: 300, step: 0.1 }}
            fullWidth
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={1}>
          {Number.isFinite(bmi)
            ? `Your BMI is ${bmi} - ${classify(bmi)}`
            : "Enter height and weight to calculate your BMI"}
        </Typography>

        <Button variant="contained" size="small" onClick={save}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
};

export default BmiCard;
