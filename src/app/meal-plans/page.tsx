import React from "react";
import MealplansClient from "./MealplansClient";

export const metadata = {
  title: "FitNutrition — Meal Plans",
  description:
    "Personalized plans tailored to your goals.",
};

export default function MealplansPage() {
  return <MealplansClient />;
}
