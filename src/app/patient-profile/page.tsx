import React from "react";
import PatientProfile from "./PatientProfile";

export const metadata = {
  title: "FitNutrition — Profile",
  description:
    "Log in to Fit Nutrition to access your dashboard, manage clients, and view meal plans.",
};

export default function PatientProfilePage() {
  return <PatientProfile />;
}
