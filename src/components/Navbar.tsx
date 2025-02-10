"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AppBar, Toolbar, Box, Button, Avatar, Typography } from "@mui/material";
import nitImage from "../../public/images/nitfut.jpg";

interface NavbarProps {
  dietitianName: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ dietitianName, onLogout }) => {
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
              <Button color="secondary" variant="contained" onClick={onLogout}>
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
