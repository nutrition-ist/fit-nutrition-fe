"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";

/** Define Patient Data Structure */
interface Patient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  dietitian: number;
  profile_picture: string | null;
}

/** Define Props for RegisterPatientDialog */
interface RegisterPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onPatientRegistered: (newPatient: Patient) => void;
}

/** Define Input Fields for New Patient */
interface NewPatientData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
}

/** Register Patient Dialog Component */
const RegisterPatient: React.FC<RegisterPatientDialogProps> = ({
  open,
  onClose,
  onPatientRegistered,
}) => {
  const [newPatient, setNewPatient] = useState<NewPatientData>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
  });

  const [registerError, setRegisterError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  // Function to register a new patient
  const handleRegisterPatient = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setRegisterError("You are not authenticated.");
      return;
    }

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hazalkaynak.pythonanywhere.com/";

      const response = await axios.post<Patient>(`${apiUrl}/register/patient/`, newPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdPatient: Patient = response.data;

      // Pass the new patient back to the parent component
      onPatientRegistered(createdPatient);
      onClose(); // Close the dialog
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setRegisterError("Failed to register patient. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Register New Patient</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Username"
          name="username"
          value={newPatient.username}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Email"
          name="email"
          type="email"
          value={newPatient.email}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="First Name"
          name="first_name"
          value={newPatient.first_name}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Last Name"
          name="last_name"
          value={newPatient.last_name}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Phone"
          name="phone"
          value={newPatient.phone}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Password"
          name="password"
          type="password"
          value={newPatient.password}
          onChange={handleInputChange}
        />
        {registerError && (
          <Typography color="error" textAlign="center">
            {registerError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleRegisterPatient}>
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterPatient;
