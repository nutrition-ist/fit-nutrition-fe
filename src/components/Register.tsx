"use client";

import React, { ChangeEvent, FC } from "react";
import { Stack, TextField, Typography, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

/* ---------- types (unchanged) ---------- */
export interface NewPatientData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
}
interface RegisterProps {
  newPatient: NewPatientData;
  registerError: string | null;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/* ---------- helper ---------- */
const Rule: FC<{ ok: boolean; children: string }> = ({ ok, children }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    {ok ? (
      <CheckCircleOutlineIcon fontSize="inherit" color="success" />
    ) : (
      <CancelOutlinedIcon fontSize="inherit" color="error" />
    )}
    <Typography variant="caption" color={ok ? "success.main" : "error.main"}>
      {children}
    </Typography>
  </Stack>
);

/* ---------- component ---------- */
const Register: FC<RegisterProps> = ({
  newPatient,
  registerError,
  onInputChange,
}) => {
  const password = newPatient.password;

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allValid =
    rules.length &&
    rules.uppercase &&
    rules.lowercase &&
    rules.number &&
    rules.special;

  /* text-field style snippet: slightly more rounded outline */
  const tfSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 2 },
  };

  return (
    <>
      <Stack spacing={3}>
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="Username"
          name="username"
          value={newPatient.username}
          onChange={onInputChange}
        />
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="Email Address"
          name="email"
          type="email"
          value={newPatient.email}
          onChange={onInputChange}
        />
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="First Name"
          name="first_name"
          value={newPatient.first_name}
          onChange={onInputChange}
        />
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="Last Name"
          name="last_name"
          value={newPatient.last_name}
          onChange={onInputChange}
        />
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="Phone"
          name="phone"
          value={newPatient.phone}
          onChange={onInputChange}
        />
        <TextField
          variant="outlined"
          fullWidth
          required
          sx={tfSx}
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={onInputChange}
          error={password.length > 0 && !allValid}
        />
      </Stack>

      {/* live password checklist */}
      {password.length > 0 && (
        <Box sx={{ pl: 2, mt: 1 }}>
          <Rule ok={rules.length}>Minimum 8 characters</Rule>
          <Rule ok={rules.uppercase}>Contains an uppercase letter</Rule>
          <Rule ok={rules.lowercase}>Contains a lowercase letter</Rule>
          <Rule ok={rules.number}>Contains a number</Rule>
          <Rule ok={rules.special}>Contains a special character</Rule>
        </Box>
      )}

      {registerError && (
        <Typography color="error" textAlign="center" mt={1} variant="body2">
          {registerError}
        </Typography>
      )}
    </>
  );
};

export default Register;
