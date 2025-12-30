import React from "react";
import RecipesClient from "./RecipesClient";

export const metadata = {
  title: "FitNutrition — Recipes",
  description:
    "Search and filter healthy recipes tailored to diets.",
};

export default function RecipesPage() {
  return <RecipesClient />;
}
