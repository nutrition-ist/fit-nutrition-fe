"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const WIPPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Link href="/" passHref>
          <Button
            variant="contained"
            color="primary"
            sx={{ position: "absolute", top: 20, left: 20 }}
          >
            Back to Home
          </Button>
        </Link>

        <Typography variant="h2" sx={{ mb: 2 }}>
          🚧 Work in Progress 🚧
        </Typography>
        <Typography variant="body1">
          This feature is currently under development. Check back later!
        </Typography>
      </Box>
    </>
  );
};

export default WIPPage;
