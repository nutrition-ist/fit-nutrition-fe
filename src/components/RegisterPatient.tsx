"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import Register, { NewPatientData } from "./Register"; // Import our new Register component

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
        "https://hazalkaynak.pythonanywhere.com";

      const response = await axios.post<Patient>(
        `${apiUrl}/register/patient/`,
        newPatient,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const createdPatient: Patient = response.data;

      // Pass the new patient back to the parent component
      onPatientRegistered(createdPatient);
      // Close the dialog
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setRegisterError("Failed to register patient. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Register New Patient</DialogTitle>
      <DialogContent>
        <Register
          newPatient={newPatient}
          registerError={registerError}
          onInputChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegisterPatient}
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterPatient;
