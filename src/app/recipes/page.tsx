"use client";

import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LunchDiningOutlinedIcon from "@mui/icons-material/LunchDiningOutlined";
import KebabDiningOutlinedIcon from "@mui/icons-material/KebabDiningOutlined";
import YardOutlinedIcon from "@mui/icons-material/YardOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchBar from "@/components/SearchBar";
import RecipeList, { Recipe } from "@/components/RecipeList";
import RecipeDetail from "@/components/RecipeDetail";

/* ------------------------------------------------------------------ */
/*  landing‑page “quick menu”                                         */
/* ------------------------------------------------------------------ */
const categories: { tag: string; label: string; icon: JSX.Element }[] = [
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

/* ------------------------------------------------------------------ */
/*  component                                                          */
/* ------------------------------------------------------------------ */
export default function RecipesPage() {
  /* ---------- state ---------- */
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);

  /* view = "home" | "category" | "search" | "detail" */
  const view: "detail" | "home" | "category" | "search" = selected
    ? "detail"
    : activeTag
    ? "category"
    : query
    ? "search"
    : "home";

  /* ---------- load most‑used tags for chip bar ------------ */
  useEffect(() => {
    fetch("/last_30_recipes.json")
      .then((r) => r.json())
      .then((data: { tags: string }[]) => {
        const counts: Record<string, number> = {};
        data.forEach((r) =>
          JSON.parse(r.tags ?? "[]").forEach(
            (t: string) => (counts[t] = (counts[t] ?? 0) + 1)
          )
        );
        setTopTags(
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([t]) => t)
        );
      });
  }, []);

  /* ---------- detail screen ---------- */
  if (view === "detail" && selected) {
    return <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />;
  }

  /* ---------- landing (“home”) ---------- */
  if (view === "home") {
    return (
      <>
        <Box
          sx={{
            bgcolor: "grey.900",
            color: "#fff",
            py: { xs: 6, md: 10 },
            textAlign: "center",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom>
              Find the Perfect Recipe for You
            </Typography>

            <SearchBar
              placeholder="Search by ingredient, diet, cuisine or recipe name…"
              onSearch={(q) => setQuery(q)}
            />
          </Container>
        </Box>

        <Container sx={{ py: 5 }}>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Our Most Popular Recipe Categories
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {categories.map((c) => (
              <Grid item xs={6} sm={3} md={3} key={c.tag} textAlign="center">
                <Button
                  variant="contained"
                  onClick={() => setActiveTag(c.tag)}
                  sx={{
                    borderRadius: "50%",
                    width: 80,
                    height: 80,
                    mb: 1,
                  }}
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
      </>
    );
  }

  /* ---------- category OR search list ---------- */
  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        size="small"
        onClick={() => {
          setActiveTag(null);
          setQuery("");
        }}
        sx={{ mb: 2 }}
      >
        Home
      </Button>

      {view === "category" && (
        <Typography variant="h5" fontWeight={600} mb={2}>
          {activeTag}
        </Typography>
      )}

      {view === "search" && (
        <>
          <SearchBar
            defaultValue={query}
            placeholder="Search recipes…"
            onSearch={(q) => setQuery(q)}
          />
          <Stack direction="row" spacing={1} mt={2} mb={3} flexWrap="wrap">
            {topTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                clickable
                color={activeTag === tag ? "primary" : "default"}
                variant={activeTag === tag ? "filled" : "outlined"}
                onClick={() =>
                  setActiveTag((prev) => (prev === tag ? null : tag))
                }
              />
            ))}
          </Stack>
        </>
      )}

      <RecipeList
        grid
        globalOnly
        searchQuery={query}
        tagFilter={activeTag}
        onSelect={setSelected}
      />
    </Box>
  );
}
