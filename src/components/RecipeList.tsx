"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

/* ------------------------------------------------------------------ */
/*  data types                                                         */
/* ------------------------------------------------------------------ */
export interface Recipe {
  id: number;
  name: string;
  instructions: string;
  image: string;
  tags: string; // JSON string, e.g. '["Vegan","Quick"]'
  calories: string;
  protein: string;
  sodium: string;
  rating: number;
  owner_id: number;
  private: 0 | 1;
}

/* ------------------------------------------------------------------ */
/*  props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  ownerId?: number; // allow private + global merge for dashboards
  globalOnly?: boolean; // restrict to owner_id === 0
  limit?: number; // cut‑off for previews
  grid?: boolean; // gallery vs. list view
  searchQuery?: string; // free‑text filter
  tagFilter?: string | null; // tag chip filter
  onSelect?: (recipe: Recipe) => void; // click handler
};

/* ------------------------------------------------------------------ */
/*  component                                                          */
/* ------------------------------------------------------------------ */
const RecipeList: React.FC<Props> = ({
  ownerId,
  globalOnly = false,
  limit,
  grid = false,
  searchQuery = "",
  tagFilter = null,
  onSelect,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------- load once ----------------------- */
  useEffect(() => {
    fetch("/last_30_recipes.json")
      .then((r) => r.json())
      .then((data: Recipe[]) => setRecipes(data))
      .catch(() => setError("Couldn’t load recipes."))
      .finally(() => setLoading(false));
  }, []);

  /* ----------------------- filtering ----------------------- */
  const visible = useMemo(() => {
    let pool = recipes;

    if (globalOnly) {
      pool = pool.filter((r) => r.owner_id === 0);
    } else if (typeof ownerId === "number") {
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

  /* ----------------------- states -------------------------- */
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

  /* ----------------------- render -------------------------- */
  const Container = (grid ? Grid : Stack) as React.ElementType;
  const containerProps = grid
    ? { container: true, spacing: 2 }
    : { spacing: 2 };

  return (
    <Container {...containerProps}>
      {visible.map((r) => {
        const tags: string[] = JSON.parse(r.tags ?? "[]");

        const content = (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              variant="rounded"
              src={r.image}
              alt={r.name}
              sx={{ width: 56, height: 56 }}
            />
            <Box flex={1}>
              <Typography fontWeight={600} noWrap>
                {r.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {tags.join(", ")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ⚡{r.calories}  💪{r.protein}  🧂{r.sodium}
              </Typography>
            </Box>
            {!!r.rating && (
              <Typography variant="caption" color="text.secondary">
                ⭐ {r.rating}
              </Typography>
            )}
          </Stack>
        );

        const card = (
          <Card sx={{ p: 0 }}>
            <CardActionArea onClick={() => onSelect?.(r)} sx={{ p: 2 }}>
              {content}
            </CardActionArea>
          </Card>
        );

        return grid ? (
          <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
            {card}
          </Grid>
        ) : (
          <React.Fragment key={r.id}>{card}</React.Fragment>
        );
      })}
    </Container>
  );
};

export default RecipeList;
