"use client";

import React, { JSX } from "react";
import { Button, Container, Grid, Typography } from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import KebabDiningOutlinedIcon from "@mui/icons-material/KebabDiningOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";

export interface Category {
  tag: string;
  label: string;
  icon: JSX.Element;
}

const categories: Category[] = [
  {
    tag: "Quick & Easy",
    label: "Quick & Easy",
    icon: <MenuBookOutlinedIcon />,
  },
  {
    tag: "Comfort",
    label: "Comfort & Classic",
    icon: <LunchDiningOutlinedIcon />,
  },
  {
    tag: "Cuisine",
    label: "Cuisine‑Specific",
    icon: <KebabDiningOutlinedIcon />,
  },
  { tag: "One‑Pot", label: "One‑Pot & Batch", icon: <MenuBookOutlinedIcon /> },
  { tag: "Healthy", label: "Healthy", icon: <YardOutlinedIcon /> },
  { tag: "Vegan", label: "Vegan & Veg", icon: <MenuBookOutlinedIcon /> },
  {
    tag: "Dessert",
    label: "Desserts & Baking",
    icon: <MenuBookOutlinedIcon />,
  },
  { tag: "Prep", label: "Meal Prep / Freezer", icon: <MenuBookOutlinedIcon /> },
];

type Props = {
  onSelect: (tag: string) => void;
};

const QuickCategoryGrid: React.FC<Props> = ({ onSelect }) => (
  <Container sx={{ py: 5 }}>
    <Typography variant="h5" textAlign="center" gutterBottom>
      Our Most Popular Recipe Categories
    </Typography>
    <Grid container spacing={2} justifyContent="center">
      {categories.map((c) => (
        <Grid item xs={6} sm={3} md={3} key={c.tag} textAlign="center">
          <Button
            variant="contained"
            onClick={() => onSelect(c.tag)}
            sx={{ borderRadius: "50%", width: 80, height: 80, mb: 1 }}
          >
            {c.icon}
          </Button>
          <Typography variant="caption" display="block">
            {c.label}
          </Typography>
        </Grid>
      ))}
    </Grid>
  </Container>
);

export default QuickCategoryGrid;