/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import placeholderimage from "../../../public/images/placeholder.jpg";

const DietitianProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
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
        const dietician = response.data.dietician;
        setProfile(dietician);
        setFormData(dietician);
      } catch (err: any) {
        setError("Failed to fetch profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setError(null);
      const response = await axios.put(
        "https://hazalkaynak.pythonanywhere.com/dietitian/me/",
        { dietician: formData },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const updatedDietician = response.data.dietician;
      setProfile(updatedDietician);
      setFormData(updatedDietician);
      setIsEditing(false);
    } catch (err: any) {
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

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
              src={formData?.profile_picture || placeholderimage}
              alt="Profile"
              width={150}
              height={150}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "16px",
              }}
            />
            {isEditing && (
              <Button variant="outlined" component="label" sx={{ mb: 3 }}>
                Upload New
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData((prev: any) => ({
                          ...prev,
                          profile_picture: reader.result,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            )}

            <TextField
              label="First Name"
              fullWidth
              name="first_name"
              value={formData?.first_name || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Last Name"
              fullWidth
              name="last_name"
              value={formData?.last_name || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Email"
              fullWidth
              name="email"
              value={formData?.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Phone"
              fullWidth
              name="phone"
              value={formData?.phone || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Address"
              fullWidth
              name="address"
              value={formData?.address || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              sx={{ mb: 2 }}
            />
          </Box>
        </Grid>

        {/* About Me Section */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            About Me:
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              name="about_me"
              value={formData?.about_me || ""}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />
          ) : (
            <Typography variant="body1" sx={{ mb: 3 }}>
              {profile?.about_me || "No information available."}
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Buttons for Editing */}
      <Box sx={{ mt: 5, textAlign: "center" }}>
        {isEditing ? (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mx: 2 }}
            >
              Save
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DietitianProfile;
