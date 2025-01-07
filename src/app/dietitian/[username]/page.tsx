import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import placeholderimage from "Fi/placeholder.jpg";
import { notFound } from "next/navigation";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  about_me: string;
  profile_picture?: string;
}

const fetchDietitianProfile = async (username: string): Promise<Profile | null> => {
  try {
    const response = await axios.get(
      `https://hazalkaynak.pythonanywhere.com/dietitian/${username}`
    );

    if (response.data && response.data.dietician) {
      return response.data.dietician;
    } else {
      console.error("Unexpected API response format.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Main Profile Page Component
const DietitianProfilePage = async ({ params }: { params: { username: string } }) => {
  const { username } = params;
  const profile = await fetchDietitianProfile(username);

  // Redirect to 404 if profile is not found
  if (!profile) {
    return notFound();
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
