"use client";

import React, { ChangeEvent, FC } from "react";
import { TextField, Typography } from "@mui/material";

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

const Register: FC<RegisterProps> = ({
  newPatient,
  registerError,
  onInputChange,
}) => (
  <>
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
      value={newPatient.password}
      onChange={onInputChange}
      required
    />

    {registerError && (
      <Typography color="error" textAlign="center" variant="body2">
        {registerError}
      </Typography>
    )}
  </>
);

export default Register;
