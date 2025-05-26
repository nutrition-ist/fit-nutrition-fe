"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import axios from "axios";

interface LoginFormData {
  username: string; //still called “username” for the API, but its email
  password: string;
}

const pillBtn = {
  borderRadius: 99,
  textTransform: "none",
  fontWeight: 600,
};

const socialBtn = {
  ...pillBtn,
  borderColor: "success.main",
  color: "success.main",
  "&:hover": {
    bgcolor: "success.main",
    color: "#fff",
    borderColor: "success.main",
  },
};

const LoginPage: React.FC = () => {
  /* ---------------- state ---------------- */
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [keepMeLogged, setKeepMeLogged] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({});
  const [redirectUrl, setRedirectUrl] = useState("dietitian-dashboard");

  /* ---------------- token check on mount ---------------- */
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken");
      const qp = new URLSearchParams(window.location.search);
      const dest = qp.get("redirect") || "dietitian-dashboard";
      setRedirectUrl(dest);

      if (!token) return;

      try {
        const api =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://hazalkaynak.pythonanywhere.com/";
        await axios.get(`${api}/token/verify/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.location.href = `/${dest}`;
      } catch {
        const refreshed = await refreshAccessToken();
        if (!refreshed) logoutUser();
      }
    })();
  }, []);

  /* ---------------- helpers ---------------- */
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg({});

    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hazalkaynak.pythonanywhere.com/";
      const { data } = await axios.post(`${api}/token/`, formData);

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", formData.username);
      localStorage.setItem(
        "role",
        redirectUrl === "dietitian-dashboard" ? "dietitian" : "patient"
      );
      setMsg({ ok: "Login successful!" });

      /* optionally respect 'keep me logged in' by skipping refresh-token storage */
      if (!keepMeLogged) localStorage.removeItem("refreshToken");

      window.location.href = `/${redirectUrl}`;
    } catch (err) {
      setMsg({
        err: axios.isAxiosError(err)
          ? err.response?.data?.detail || "Invalid username or password."
          : "An unexpected error occurred.",
      });
    }
  };

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;

    try {
      const api =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://hazalkaynak.pythonanywhere.com/";
      const { data } = await axios.post(`${api}/token/refresh/`, { refresh });
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
    window.location.href = "/login";
  };

  /* ---------------- UI ---------------- */
  return (
    <Box component="form" onSubmit={handleSubmit} py={8}>
      <Card
        elevation={0}
        sx={{
          maxWidth: 440,
          mx: "auto",
          p: 5,
          border: 0,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {/* ---------- header ---------- */}
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
          Log In to Fitnutrition
        </Typography>
        <Typography textAlign="center" color="text.secondary" mb={4}>
          Access your professional dashboard, manage client plans and track
          progress.
        </Typography>

        {/* ---------- social buttons ---------- */}
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            sx={socialBtn}
          >
            Log in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            sx={socialBtn}
          >
            Log in with Facebook
          </Button>
        </Stack>

        {/* ---------- divider ---------- */}
        <Stack direction="row" alignItems="center" spacing={2} my={4}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" fontWeight={500}>
            Or login with email
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Stack>

        {/* ---------- email & password ---------- */}
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

        {/* ---------- keep me logged in ---------- */}
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

        {/* ---------- messages ---------- */}
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

        {/* ---------- submit ---------- */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ ...pillBtn, mt: 2, py: 1.5 }}
        >
          Log In
        </Button>

        {/* ---------- links ---------- */}
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
};

export default LoginPage;
