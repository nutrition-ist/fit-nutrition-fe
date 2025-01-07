"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import Link from "next/link";
import axios from "axios";

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>("dietitian-dashboard");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const queryParams = new URLSearchParams(window.location.search);
    const redirect = queryParams.get("redirect") || "dietitian-dashboard";

    setRedirectUrl(redirect);

    if (token) {
      window.location.href = `/${redirect}`;
    }
  }, []);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/"; 

      const response = await axios.post(`${apiUrl}/token/`, formData);

      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      setSuccessMessage("Login successful!");


      window.location.href = `/${redirectUrl}`;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    }
  };

  return (
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
        boxShadow: 3,
        p: 3,
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h4" textAlign="center" sx={{ fontWeight: "bold" }}>
        Login
      </Typography>

      <TextField
        label="Username"
        name="username"
        value={formData.username}
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
        Login
      </Button>

      <Box textAlign="center" mt={2}>
        <Link href="/" passHref>
          <Button variant="outlined" color="secondary">
            Go Back Home
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
