import React from "react";
import MeasurementsClient from "./MeasurementsClient";

export const metadata = {
  title: "FitNutrition — Measurements",
  description:
    "Log, track, and analyze body measurements over time.",
};

export default function MeasurementsPage() {
  return <MeasurementsClient />;
}
