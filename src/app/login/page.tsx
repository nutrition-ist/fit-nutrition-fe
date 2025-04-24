"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import Link from "next/link";
import axios from "axios";
import Navbar from "@/components/Navbar";

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
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      const queryParams = new URLSearchParams(window.location.search);
      const redirect = queryParams.get("redirect") || "dietitian-dashboard";

      setRedirectUrl(redirect);

      if (!token) {
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://hazalkaynak.pythonanywhere.com/";

        await axios.get(`${apiUrl}/token/verify/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If token is valid, redirect
        window.location.href = `/${redirect}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.warn("Access token expired. Trying to refresh...");
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
          logoutUser(); // Logout if refresh fails
        }
      }
    };

    checkToken();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hazalkaynak.pythonanywhere.com/";

      const response = await axios.post(`${apiUrl}/token/`, formData);

      const { access, refresh } = response.data;
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("username", formData.username);
      /* 
          Gelecek kutsiye idea, ilk başta dietitian endpointini deneriz access var ise,(200response ise) role=dietitian, 404 ya da 403 gelirse patient olur direkt.
          Çünkü hesabı varsa visitor değil sadece accesi yok demek ki patient, backende sor. 
          Şöyle bişi
          let role: "dietitian" | "patient" = "patient";
          try {
            await axios.get(`${apiUrl}dietitian/me/`, {
              headers: { Authorization: `Bearer ${access}` },
            });
            role = "dietitian";
          } catch {
            role = "patient";
          }
          localStorage.setItem("role", role);
          */
      const isDietitian = redirectUrl === "dietitian-dashboard";
      localStorage.setItem("role", isDietitian ? "dietitian" : "patient");
      setSuccessMessage("Login successful!");

      window.location.href = `/${redirectUrl}`;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Invalid username or password.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      return false;
    }

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hazalkaynak.pythonanywhere.com/";

      const response = await axios.post(`${apiUrl}/token/refresh/`, {
        refresh: refreshToken,
      });

      localStorage.setItem("accessToken", response.data.access);
      return true;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return false;
    }
  };

  //  Logout function
  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    window.location.href = "/login";
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
    </>
  );
};

export default LoginPage;
