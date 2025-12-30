"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import GoogleAuthButton from "@/components/GoogleAuthButton";

type Role = "dietitian" | "patient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeJwtPayload = <T = any,>(jwt: string): T | null => {
  try {
    const part = jwt.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
    const json = atob(b64 + "=".repeat(pad));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

const roleFromJwt = (accessToken: string): Role => {
  const payload = decodeJwtPayload<{ role?: string; user_type?: string }>(
    accessToken
  );
  const raw = (payload?.role ?? payload?.user_type ?? "")
    .toString()
    .toUpperCase();
  return raw === "D" ? "dietitian" : "patient";
};

interface LoginFormData {
  username: string;
  password: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

const pillBtn = { borderRadius: 99, textTransform: "none", fontWeight: 600 };

export default function LoginClient() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [keepMeLogged, setKeepMeLogged] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({});

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        await axios.get(`${API_BASE}token/verify/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const role = roleFromJwt(token);
        const qp = new URLSearchParams(window.location.search);
        const dest =
          qp.get("redirect") ||
          (role === "dietitian" ? "dietitian-dashboard" : "patient-dashboard");
        window.location.href = `/${dest}`;
      } catch {
        const refreshed = await refreshAccessToken();
        if (!refreshed) logoutUser();
      }
    })();
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg({});
    try {
      const { data } = await axios.post(`${API_BASE}token/`, formData);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username ?? formData.username);
      const role = roleFromJwt(data.access);
      localStorage.setItem("role", role);
      if (!keepMeLogged) localStorage.removeItem("refreshToken");
      const qp = new URLSearchParams(window.location.search);
      const dest =
        qp.get("redirect") ||
        (role === "dietitian" ? "dietitian-dashboard" : "patient-dashboard");
      window.location.href = `/${dest}`;
    } catch (err) {
      setMsg({
        err: axios.isAxiosError(err)
          ? err.response?.data?.detail || "Invalid username or password."
          : "An unexpected error occurred.",
      });
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;
    try {
      const { data } = await axios.post(`${API_BASE}token/refresh/`, {
        refresh,
      });
      localStorage.setItem("accessToken", data.access);
      return true;
    } catch {
      return false;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <Box component="form" onSubmit={handleSubmit} py={8}>
      <Card
        elevation={0}
        sx={{
          maxWidth: 440,
          mx: "auto",
          p: 5,
          border: 0,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Log In to Fitnutrition
        </Typography>
        <Typography textAlign="center" color="text.secondary" mb={4}>
          Access your professional dashboard, manage client plans and track
          progress.
        </Typography>

        <Stack spacing={2}>
          <GoogleAuthButton
            redirectTo="patient-dashboard"
            keepMeLogged={keepMeLogged}
            onMessage={setMsg}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2} my={4}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" fontWeight={500}>
            Or login with email
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Stack>

        <Stack spacing={3}>
          <TextField
            variant="standard"
            required
            fullWidth
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={onChange}
          />
          <TextField
            variant="standard"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={onChange}
          />
        </Stack>

        <FormControlLabel
          sx={{ mt: 3 }}
          control={
            <Checkbox
              checked={keepMeLogged}
              onChange={(e) => setKeepMeLogged(e.target.checked)}
              sx={{ p: 0.5 }}
            />
          }
          label={<Typography variant="body2">Keep me logged in.</Typography>}
        />

        {msg.err && (
          <Typography color="error" textAlign="center" mt={1}>
            {msg.err}
          </Typography>
        )}
        {msg.ok && (
          <Typography color="primary" textAlign="center" mt={1}>
            {msg.ok}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ ...pillBtn, mt: 2, py: 1.5 }}
        >
          Log In
        </Button>

        <Button
          href="/forgot-password"
          fullWidth
          variant="text"
          sx={{ mt: 1, textTransform: "none" }}
        >
          Forgot your password?
        </Button>

        <Stack spacing={1} mt={4}>
          <Typography variant="body2" textAlign="center">
            New to Fitnutrition?
          </Typography>
          <Button
            href="/register"
            fullWidth
            variant="outlined"
            sx={{
              ...pillBtn,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.main",
                color: "#fff",
                borderColor: "primary.main",
              },
            }}
          >
            Create an Account
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}
