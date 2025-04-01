"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppBar, Toolbar, Box, Button, Avatar, Typography } from "@mui/material";
import nitImage from "../../public/images/nitfut.jpg";

const Navbar: React.FC = () => {
  const [dietitianName, setDietitianName] = useState<string | null>(null);

  // Get the dietitian's name from localStorage when the component mounts
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setDietitianName(storedName);
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("dietitianName"); // Remove stored name
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <AppBar position="static" color="primary" sx={{ height: 64 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Section: Navigation Links */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Link href="/dietitian-dashboard" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/dietitian" passHref>
            <Button color="inherit">Dietitians</Button>
          </Link>
          <Link href="/recipes" passHref>
            <Button color="inherit">Recipes</Button>
          </Link>
        </Box>

        {/* Center Section: Logo */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link href="/" passHref>
            <Image
              src={nitImage}
              alt="Website Logo"
              width={40}
              height={40}
              style={{ cursor: "pointer" }}
            />
          </Link>
        </Box>

        {/* Right Section: Profile & Logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {dietitianName ? (
            <>
              <Avatar src="" alt="Profile" sx={{ width: 32, height: 32 }} />
              <Typography color="inherit">{dietitianName}</Typography>
              <Button color="secondary" variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button color="inherit">Login</Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
