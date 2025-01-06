/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import placeholderimage from "../../../../public/images/placeholder.jpg";

const DietitianProfilePage: React.FC = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const fetchDietitianProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `https://hazalkaynak.pythonanywhere.com/dietitian/${username}/`
        );

        if (response.data && response.data.dietician) {
          setProfile(response.data.dietician);
        } else {
          throw new Error("Unexpected API response format.");
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err.message || err);
        setError("Failed to fetch dietitian profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietitianProfile();
  }, [username]);
  if (!isClient) {
    return null;
  }

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
        {profile.first_name} {profile.last_name}&apos;s Profile
      </Typography>

      <Grid container spacing={4}>
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
              src={profile.profile_picture || placeholderimage}
              alt="Profile"
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "16px",
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Email:</strong> {profile.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Phone:</strong> {profile.phone}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Address:</strong> {profile.address}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>About Me:</strong>{" "}
            {profile.about_me || "No information available."}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DietitianProfilePage;
