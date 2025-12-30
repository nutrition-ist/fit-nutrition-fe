import React from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "FitNutrition — Login",
  description:
    "Log in to Fit Nutrition to access your dashboard, manage clients, and view meal plans.",
};

export default function LoginPage() {
  return <LoginClient />;
}
