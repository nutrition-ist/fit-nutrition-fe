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

export interface Recipe {
  id: number;
  name: string;
  instructions: string;
  image: string;
  tags: string;
  calories: string;
  protein: string;
  sodium: string;
  rating: number;
  owner_id: number;
  private: 0 | 1;
}

type Props = {
  ownerId?: number;
  globalOnly?: boolean;
  limit?: number;
  grid?: boolean;
  searchQuery?: string;
  tagFilter?: string | null;
  onSelect?: (recipe: Recipe) => void;
  // NEW
  calorieRange?: [number, number];
  dietFilter?: string[];
  allergyFilter?: string[];
  onVisibleChange?: (list: Recipe[]) => void;
};

const calToNumber = (label: string) => {
  switch (label) {
    case "low":
      return 150;
    case "medium":
      return 350;
    case "high":
      return 700;
    default:
      return 0;
  }
};

const mapDietToTags = (diet: string): string[] => {
  const m: Record<string, string[]> = {
    Vegan: ["Vegan"],
    Vegetarian: ["Vegetarian"],
    Keto: ["Keto"],
    Paleo: ["Paleo"],
    "Low Carb": ["Low Carb"],
    "High Protein": ["High Protein"],
    "Gluten-free": ["Gluten-Free", "Wheat/Gluten-Free"],
    "Dairy-free": ["Dairy Free"],
  };
  return m[diet] ?? [diet];
};

const mapAllergyToTag = (a: string) => `${a} Free`;

const RecipeList: React.FC<Props> = ({
  ownerId,
  limit,
  globalOnly = false,
  searchQuery = "",
  tagFilter = null,
  grid = false,
  onSelect,
  calorieRange,
  dietFilter = [],
  allergyFilter = [],
  onVisibleChange,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/last_30_recipes.json")
      .then((r) => r.json())
      .then((data: Recipe[]) => setRecipes(data))
      .catch(() => setError("Couldn’t load recipes."))
      .finally(() => setLoading(false));
  }, []);

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
          r.instructions.toLowerCase().includes(q) ||
          JSON.parse(r.tags ?? "[]")
            .join(" ")
            .toLowerCase()
            .includes(q)
      );
    }

    if (tagFilter) {
      pool = pool.filter((r) => JSON.parse(r.tags ?? "[]").includes(tagFilter));
    }

    if (dietFilter.length) {
      pool = pool.filter((r) => {
        const t: string[] = JSON.parse(r.tags ?? "[]");
        return dietFilter.some((d) =>
          mapDietToTags(d).some((mt) => t.includes(mt))
        );
      });
    }

    if (allergyFilter.length) {
      pool = pool.filter((r) => {
        const t: string[] = JSON.parse(r.tags ?? "[]");
        return allergyFilter.every((a) => t.includes(mapAllergyToTag(a)));
      });
    }

    if (calorieRange) {
      const [min, max] = calorieRange;
      pool = pool.filter((r) => {
        const kcal = calToNumber(r.calories);
        return kcal >= min && kcal <= max;
      });
    }

    const out = typeof limit === "number" ? pool.slice(0, limit) : pool;
    return out;
  }, [
    recipes,
    ownerId,
    globalOnly,
    searchQuery,
    tagFilter,
    limit,
    calorieRange,
    dietFilter,
    allergyFilter,
  ]);

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible, onVisibleChange]);

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
  if (!visible.length)
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
        const tags: string[] = JSON.parse(r.tags ?? "[]");
        const card = (
          <Card sx={{ p: 0 }}>
            <CardActionArea onClick={() => onSelect?.(r)} sx={{ p: 2 }}>
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
                    ⚡{r.calories} 💪{r.protein} 🧂{r.sodium}
                  </Typography>
                </Box>
                {!!r.rating && (
                  <Typography variant="caption" color="text.secondary">
                    ⭐ {r.rating}
                  </Typography>
                )}
              </Stack>
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
