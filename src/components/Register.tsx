"use client";

import React, { ChangeEvent, FC } from "react";
import { TextField, Typography, Box, Stack } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

/** Fields needed by the shared register form. */
export interface NewPatientData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
}

/** Props expected by the component (unchanged, so RegisterPatient.tsx keeps working). */
interface RegisterProps {
  newPatient: NewPatientData;
  registerError: string | null;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/** Helper to render one rule line with an icon */
const Rule: FC<{ ok: boolean; children: string }> = ({ ok, children }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    {ok ? (
      <CheckCircleOutlineIcon fontSize="inherit" color="success" />
    ) : (
      <CancelOutlinedIcon fontSize="inherit" color="error" />
    )}
    <Typography variant="caption" color={ok ? "success.main" : "error"}>
      {children}
    </Typography>
  </Stack>
);

/**
 * Pure presentational block – renders inputs + live password requirement list.
 */
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

  return (
    <>
      {/* Core inputs */}
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="Username"
        name="username"
        value={newPatient.username}
        onChange={onInputChange}
        required
      />
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="Email Address"
        name="email"
        type="email"
        value={newPatient.email}
        onChange={onInputChange}
        required
      />
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="First Name"
        name="first_name"
        value={newPatient.first_name}
        onChange={onInputChange}
        required
      />
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="Last Name"
        name="last_name"
        value={newPatient.last_name}
        onChange={onInputChange}
        required
      />
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="Phone"
        name="phone"
        value={newPatient.phone}
        onChange={onInputChange}
        required
      />
      <TextField
        variant="standard"
        fullWidth
        margin="dense"
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={onInputChange}
        required
        error={password.length > 0 && !allValid}
      />

      {/* Live requirement checklist */}
      {password.length > 0 && (
        <Box sx={{ pl: 3, mb: 1 }}>
          <Rule ok={rules.length}>Minimum 8 characters</Rule>
          <Rule ok={rules.uppercase}>Contains an uppercase letter</Rule>
          <Rule ok={rules.lowercase}>Contains a lowercase letter</Rule>
          <Rule ok={rules.number}>Contains a number</Rule>
          <Rule ok={rules.special}>Contains a special character</Rule>
        </Box>
      )}

      {registerError && (
        <Typography color="error" textAlign="center" variant="body2">
          {registerError}
        </Typography>
      )}
    </>
  );
};

export default Register;
