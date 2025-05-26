"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";

interface Recipe {
  id: number;
  name: string;
  instructions: string;
  image: string;
  tags: string; // e.g. "[\"Cookies\",\"Dessert\"]"
  calories: string;
  protein: string;
  sodium: string;
  rating: number;
  owner_id: number;
  private: 0 | 1;
}

type Props = {
  ownerId?: number; // the logged-in dietitian
  globalOnly?: boolean;
  limit?: number; // cut-off for dashboard preview
  grid?: boolean; // full gallery vs. list
  searchQuery?: string;
  tagFilter?: string | null;
};

const RecipeList: React.FC<Props> = ({
  ownerId,
  limit,
  globalOnly = false,
  searchQuery = "",
  tagFilter = null,
  grid = false,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- load once ---- */
  useEffect(() => {
    fetch("/last_30_recipes.json")
      .then((r) => r.json())
      .then((data: Recipe[]) => setRecipes(data))
      .catch(() => setError("Couldn’t load recipes."))
      .finally(() => setLoading(false));
  }, []);

  /* ---- filter + slice ---- */
  const visible = useMemo(() => {
    let pool = recipes;

    // ① take only global recipes when flag is on
    if (globalOnly) {
      pool = pool.filter((r) => r.owner_id === 0);
    } else if (typeof ownerId === "number") {
      // ② otherwise apply owner logic (dashboard case)
      pool = pool.filter((r) => r.owner_id === 0 || r.owner_id === ownerId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.instructions.toLowerCase().includes(q)
      );
    }

    if (tagFilter) {
      pool = pool.filter((r) => JSON.parse(r.tags ?? "[]").includes(tagFilter));
    }

    return typeof limit === "number" ? pool.slice(0, limit) : pool;
  }, [recipes, ownerId, globalOnly, searchQuery, tagFilter, limit]);

  /* ---- render ---- */
  if (loading)
    return (
      <Box py={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box py={4} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );

  if (visible.length === 0)
    return (
      <Box py={4} textAlign="center">
        <Typography>No recipes yet.</Typography>
      </Box>
    );

  const Container = (grid ? Grid : Stack) as React.ElementType;
  const containerProps = grid
    ? { container: true, spacing: 2 }
    : { spacing: 2 };
  return (
    <Container {...containerProps}>
      {visible.map((r) => {
        const tagArr: string[] = JSON.parse(r.tags ?? "[]");
        const Inner = (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={r.image}
              alt={r.name}
              sx={{ width: 56, height: 56 }}
            />
            <Box flex={1}>
              <Typography fontWeight={600}>{r.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {tagArr.join(", ")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ⚡{r.calories}, 💪{r.protein}, 🧂{r.sodium}
              </Typography>
            </Box>
            {!!r.rating && (
              <Typography variant="caption" color="text.secondary">
                ⭐ {r.rating}
              </Typography>
            )}
          </Stack>
        );

        return grid ? (
          <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
            <Card sx={{ p: 2 }}>{Inner}</Card>
          </Grid>
        ) : (
          <Card key={r.id} sx={{ p: 2 }}>
            {Inner}
          </Card>
        );
      })}
    </Container>
  );
};

export default RecipeList;
