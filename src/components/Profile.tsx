import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import Image from "next/image";
import placeholderimage from "../../public/images/placeholder.jpg";

interface ProfileProps {
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    about_me: string;
    profile_picture?: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 5, px: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4} textAlign="center">
          <Image
            src={
              profile.profile_picture
                ? `https://hazalkaynak.pythonanywhere.com/${profile.profile_picture}`
                : placeholderimage
            }
            alt="Profile"
            width={180}
            height={180}
            unoptimized
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "16px",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <Typography variant="body1">
            <strong>Email:</strong> {profile.email}
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> {profile.phone}
          </Typography>
          <Typography variant="body1">
            <strong>Address:</strong> {profile.address}
          </Typography>
          <Typography variant="body1">
            <strong>About Me:</strong>{" "}
            {profile.about_me || "No information available."}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
