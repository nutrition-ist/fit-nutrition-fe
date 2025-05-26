"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import RecipeList from "@/components/RecipeList";
import SearchBar from "@/components/SearchBar";

interface RecipeJSON {
  tags: string;
}

export default function RecipesPage() {
  /* --- search + tag state ----------------------------------- */
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [topTags, setTopTags] = useState<string[]>([]);

  /* --- load once: compute 8 most-used tags ------------------- */
  useEffect(() => {
    fetch("/last_30_recipes.json")
      .then((r) => r.json())
      .then((data: RecipeJSON[]) => {
        const counts: Record<string, number> = {};
        data.forEach((r) =>
          JSON.parse(r.tags ?? "[]").forEach(
            (t: string) => (counts[t] = (counts[t] ?? 0) + 1)
          )
        );
        const popular = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([tag]) => tag);
        setTopTags(popular);
      });
  }, []);

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Recipes
      </Typography>

      {/* ---- search field ------------------------------------ */}
      <SearchBar placeholder="Search recipes…" onSearch={(q) => setQuery(q)} />

      {/* ---- top-tag chips ----------------------------------- */}
      <Stack direction="row" spacing={1} mt={2} mb={3} flexWrap="wrap">
        {topTags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            clickable
            color={activeTag === tag ? "primary" : "default"}
            variant={activeTag === tag ? "filled" : "outlined"}
            onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
          />
        ))}
      </Stack>

      {/* ---- recipe gallery ---------------------------------- */}
      <RecipeList
        grid
        globalOnly // show only owner_id === 0
        searchQuery={query}
        tagFilter={activeTag}
      />
    </Box>
  );
}
