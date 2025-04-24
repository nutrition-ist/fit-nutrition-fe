"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import Image from "next/image";
import axios from "axios";
import placeholderimage from "../../../public/images/placeholder.jpg";

interface Profile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  about_me?: string;
  qualifications?: string[];
  phone: string;
  address: string;
  profile_picture: string | null;
  facebook: string[] | null;
  instagram: string[] | null;
  x_twitter: string[] | null;
  youtube: string[] | null;
  whatsapp: string[] | null;
}
const DietitianProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        // Redirect to login with a return URL
        window.location.href = `/login?redirect=dietitian-dashboard`;
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          "https://hazalkaynak.pythonanywhere.com/dietitian/me/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(response);
        setProfile(response.data.dietician);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching dietitian profile", err.message);
          setError(
            "Failed to fetch dietitian profile, Please try again later."
          );
        } else {
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 5, px: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
      >
        Dietitian Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Picture and Contact Information Section */}
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Image
              src={profile?.profile_picture || placeholderimage}
              alt="Profile"
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "16px",
              }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {profile?.email}
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {profile?.phone}
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {profile?.address}
            </Typography>
          </Box>
        </Grid>

        {/* About Me Section */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            About Me
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {profile?.about_me || "No information available."}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DietitianProfile;
