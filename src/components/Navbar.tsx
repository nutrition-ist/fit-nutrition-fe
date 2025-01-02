"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AppBar, Toolbar, Box, Button, Avatar } from "@mui/material";
import nitImage from "../../public/images/nitfut.jpg";

const Navbar: React.FC = () => {
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
          <Link href="/dashboard" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/dietitians" passHref>
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

        {/* Right Section: Profile Link */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src="" alt="Profile" sx={{ width: 32, height: 32 }} />
          <Link href="/patient-profile" passHref>
            <Button color="inherit">Profile</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
