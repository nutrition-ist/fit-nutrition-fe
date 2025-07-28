"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Container, Typography, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchBar from "@/components/SearchBar";
import QuickCategoryGrid from "@/components/QuickCategoryGrid";
import RecipeList, { Recipe } from "@/components/RecipeList";
import RecipeDetail from "@/components/RecipeDetail";

export default function RecipesPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [topTags, setTopTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);

  const view = selected
    ? "detail"
    : activeTag
    ? "category"
    : query
    ? "search"
    : "home";

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

  if (view === "detail" && selected) {
    return <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />;
  }

  if (view === "home") {
    return (
      <>
        {/* hero banner with search */}
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

        {/* quick category buttons */}
        <QuickCategoryGrid onSelect={setActiveTag} />
      </>
    );
  }

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
