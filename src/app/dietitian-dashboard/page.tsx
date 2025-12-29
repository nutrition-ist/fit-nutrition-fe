import React from "react";
import DietitianDashboard from "./DietitianDashboard";

export const metadata = {
  title: "FitNutrition — Dashboard",
  description:
    "Upcoming appointments, client progress and your recipes.",
};

export default function DietitiansDashboardPage() {
  return <DietitianDashboard />;
}