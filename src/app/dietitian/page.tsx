import React from "react";
import DietitianClient from "./DietitianClient";

export const metadata = {
  title: "FitNutrition — Find Dietitians",
  description:
    "Browse, filter, book qualified dietitians.",
};

export default function DietitiansPage() {
  return <DietitianClient />;
}
