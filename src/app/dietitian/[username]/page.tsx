"use client";

import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { useParams } from "next/navigation";
import Image from "next/image";
import placeholderimage from "../../../../public/images/placeholder.jpg";
import { useDietitianContext } from "@/context/DietitianContext";

const DietitianProfilePage: React.FC = () => {
  const { username } = useParams();
  const { dietitians } = useDietitianContext();

  const profile = dietitians.find((dietitian) => dietitian.username === username);

  if (!profile) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">Dietitian not found.</Typography>
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
