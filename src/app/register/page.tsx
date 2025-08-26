"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import Link from "next/link";
import Register, { NewPatientData } from "@/components/Register";
import GoogleAuthButton from "@/components/GoogleAuthButton";

interface DietitianFormData extends NewPatientData {
  address: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<DietitianFormData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    address: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /* ---------------------------------------------------------- */
  /* helpers                                                    */
  /* ---------------------------------------------------------- */
  const passwordRulesMet = (() => {
    const p = formData.password;
    return (
      p.length >= 8 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /[0-9]/.test(p) &&
      /[^A-Za-z0-9]/.test(p)
    );
  })();

  const allGood =
    agree &&
    passwordRulesMet &&
    confirmPassword === formData.password &&
    Object.values(formData).every((v) => v !== "");

  /* ---------------------------------------------------------- */
  /* handlers                                                   */
  /* ---------------------------------------------------------- */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allGood) return;

    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post(
        "https://hazalkaynak.pythonanywhere.com/register/dietician/",
        formData
      );
      setSuccessMessage("Dietitian registered successfully!");
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        password: "",
        address: "",
      });
      setConfirmPassword("");
      setAgree(false);
    } catch {
      setError("Failed to register, please try again later.");
    }
  };

  /* ---------------------------------------------------------- */
  /* render                                                     */
  /* ---------------------------------------------------------- */
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 6,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: 360, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h5" textAlign="center" fontWeight={600}>
          Create Your Fitnutrition Account
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Join Fitnutrition and start managing your clients, appointments and
          nutrition plans with ease. It only takes a minute.
        </Typography>

        {/* Social auth */}
        <GoogleAuthButton
          redirectTo="dietitian-dashboard"
          keepMeLogged={true}
          onMessage={(m) => {
            if (m.err) setError(m.err);
            if (m.ok) setSuccessMessage(m.ok);
          }}
        />

        <Divider sx={{ my: 1 }}>Or register with email</Divider>

        {/* Shared input block */}
        <Register
          newPatient={formData}
          registerError={null}
          onInputChange={handleChange}
        />

        {/* Confirm password + address */}
        <TextField
          variant="outlined"
          fullWidth
          margin="dense"
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleChange}
          required
          error={
            confirmPassword.length > 0 && confirmPassword !== formData.password
          }
        />
        <TextField
          variant="outlined"
          fullWidth
          margin="dense"
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        {/* Terms */}
        <FormControlLabel
          control={
            <Checkbox checked={agree} onChange={(_, v) => setAgree(v)} />
          }
          label={
            <Typography variant="caption">
              I agree to the <Link href="/terms">Terms of Service</Link> and
              <Link href="/privacy"> Privacy Policy</Link>.
            </Typography>
          }
          sx={{ alignItems: "flex-start" }}
        />

        {error && (
          <Typography color="error" textAlign="center" variant="body2">
            {error}
          </Typography>
        )}
        {successMessage && (
          <Typography color="primary" textAlign="center" variant="body2">
            {successMessage}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ borderRadius: 12, py: 1 }}
          disabled={!allGood}
        >
          Create Account
        </Button>

        <Typography variant="body2" textAlign="center" sx={{ mt: 1, mb: 3 }}>
          Already have a Fitnutrition account? <Link href="/login">Log In</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
