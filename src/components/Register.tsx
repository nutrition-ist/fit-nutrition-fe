"use client";

import React, { ChangeEvent, FC } from "react";
import { TextField, Typography } from "@mui/material";

/** Define the shape of your patient data. */
export interface NewPatientData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
}

/** Props required by the Register component. */
interface RegisterProps {
  newPatient: NewPatientData;
  registerError: string | null;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Register: FC<RegisterProps> = ({
  newPatient,
  registerError,
  onInputChange,
}) => {
  return (
    <>
      <TextField
        fullWidth
        margin="dense"
        label="Username"
        name="username"
        value={newPatient.username}
        onChange={onInputChange}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Email"
        name="email"
        type="email"
        value={newPatient.email}
        onChange={onInputChange}
      />
      <TextField
        fullWidth
        margin="dense"
        label="First Name"
        name="first_name"
        value={newPatient.first_name}
        onChange={onInputChange}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Last Name"
        name="last_name"
        value={newPatient.last_name}
        onChange={onInputChange}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Phone"
        name="phone"
        value={newPatient.phone}
        onChange={onInputChange}
      />
      <TextField
        fullWidth
        margin="dense"
        label="Password"
        name="password"
        type="password"
        value={newPatient.password}
        onChange={onInputChange}
      />

      {registerError && (
        <Typography color="error" textAlign="center">
          {registerError}
        </Typography>
      )}
    </>
  );
};

export default Register;
