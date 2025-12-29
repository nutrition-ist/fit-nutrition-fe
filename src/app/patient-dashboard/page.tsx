import React from "react";
import PatientDashboard from "./PatientDashboard";

export const metadata = {
  title: "FitNutrition — Dashboard",
  description:
    "Overview of your plans, progress, appointments, and dietitian.",
};

export default function PatientDashboardPage() {
  return <PatientDashboard />;
}
