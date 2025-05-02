import React, { FC } from "react";
import { Box, Chip } from "@mui/material";

export interface CategoryBarProps {
  categories: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

const CategoryBar: FC<CategoryBarProps> = ({
  categories,
  selected,
  onSelect,
}) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 1,
      justifyContent: { xs: "flex-start", md: "center" },
      my: 3,
    }}
  >
    {categories.map((c) => (
      <Chip
        key={c}
        label={c}
        clickable
        color={selected === c ? "primary" : "default"}
        onClick={() => onSelect(selected === c ? null : c)}
        sx={{ fontWeight: 600 }}
      />
    ))}

    {/* “See All Categories” is always last */}
    <Chip
      label="See All Categories"
      onClick={() => onSelect(null)}
      variant="outlined"
      sx={{ ml: "auto" }}
    />
  </Box>
);

export default CategoryBar;
