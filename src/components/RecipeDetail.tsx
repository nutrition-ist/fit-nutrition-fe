"use client";

import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Recipe } from "./RecipeList";

interface Props {
  recipe: Recipe;
  onBack: () => void;
}

const RecipeDetail: React.FC<Props> = ({ recipe, onBack }) => {
  const tags = JSON.parse(recipe.tags ?? "[]") as string[];

  return (
    <Box px={{ xs: 2, md: 6 }} py={4}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back
      </Button>

      <Box
        component="img"
        src={recipe.image}
        alt={recipe.name}
        sx={{ width: 1, maxHeight: 400, objectFit: "cover", borderRadius: 2 }}
      />

      <Typography variant="h4" mt={2} mb={1}>
        {recipe.name}
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
        {tags.map((t) => (
          <Chip key={t} label={t} size="small" />
        ))}
      </Stack>

      <Typography whiteSpace="pre-line">{recipe.instructions}</Typography>
    </Box>
  );
};

export default RecipeDetail;
