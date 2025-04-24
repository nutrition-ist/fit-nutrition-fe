"use client";

import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import KebabDiningOutlinedIcon from "@mui/icons-material/KebabDiningOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import Link from "next/link";
import SearchBar from "../../components/SearchBar";

// Section data
const sections = [
  { title: "Main", url: "#", icon: <MenuBookOutlinedIcon /> },
  { title: "American", url: "#", icon: <LunchDiningOutlinedIcon /> },
  { title: "Vegan", url: "#", icon: <MenuBookOutlinedIcon /> },
  { title: "Vegetarian", url: "#", icon: <YardOutlinedIcon /> },
  { title: "Deserts", url: "#", icon: <MenuBookOutlinedIcon /> },
  { title: "Black Culture Food", url: "#", icon: <MenuBookOutlinedIcon /> },
  { title: "Turkish", url: "#", icon: <KebabDiningOutlinedIcon /> },
  { title: "Picnic", url: "#", icon: <MenuBookOutlinedIcon /> },
];

export default function RecipesPage() {
  return (
    <>
      {/* Page Content */}
      <Grid
        container
        spacing={3}
        style={{
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        {/* Search Bar */}
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <SearchBar />

          {/* Section Buttons */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              margin: "0 auto",
              maxWidth: 480,
            }}
          >
            {sections.map((section) => (
              <Box
                key={section.title}
                sx={{ width: 100, textAlign: "center", margin: 1 }}
              >
                <Link href={section.url} passHref>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: "50%",
                      padding: 2,
                      minWidth: 72,
                      backgroundColor: "#3f51b5",
                      "&:hover": { backgroundColor: "#303f9f" },
                    }}
                  >
                    {section.icon}
                  </Button>
                </Link>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ marginTop: 0.5 }}
                >
                  {section.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
