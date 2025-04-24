"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import Navbar from "@/components/Navbar";

interface DietitianFormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  phone: string;
  address: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<DietitianFormData>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post(
        "https://hazalkaynak.pythonanywhere.com/register/dietician/",
        formData
      );

      setSuccessMessage("Dietitian registered successfully!");
      setFormData({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        phone: "",
        address: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error registering", err.message);
        setError("Failed to Register, Please try again later.");
      } else {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          margin: "0 auto",
          mt: 5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h4" textAlign="center">
          Dietitian Registration
        </Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          required
        />

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          required
        />

        {error && (
          <Typography color="error" textAlign="center">
            {error}
          </Typography>
        )}
        {successMessage && (
          <Typography color="primary" textAlign="center">
            {successMessage}
          </Typography>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </Box>
    </>
  );
};

export default RegisterPage;
