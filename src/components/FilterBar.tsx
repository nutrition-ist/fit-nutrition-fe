import React, { FC } from "react";
import {
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

export interface FilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (c: string[]) => void;

  consultType: "in-person" | "online" | "all";
  onConsultTypeChange: (t: "in-person" | "online" | "all") => void;

  showUnavailable: boolean;
  onToggleUnavailable: () => void;
  onReset: () => void;
}

const FilterBar: FC<FilterBarProps> = ({
  categories,
  selectedCategories,
  onSelectCategories,
  consultType,
  onConsultTypeChange,
  showUnavailable,
  onToggleUnavailable,
  onReset,
}) => {
  const th = useTheme();
  const space = (n: number) => th.spacing(n);

  const toggleCat = (cat: string) =>
    onSelectCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat]
    );

  return (
    <Box
      sx={{
        bgcolor: "#e6f1ef",
        px: space(2),
        py: { xs: 3, md: 5 },
        mb: { xs: 3, md: 5 },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: space(3) }}>
        Find the Right Expert
      </Typography>

      {/* chip row */}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        sx={{ mb: space(3), rowGap: space(1) }}
      >
        {categories.map((c) => {
          const active = selectedCategories.includes(c);
          return (
            <Chip
              key={c}
              label={c}
              clickable
              onClick={() => toggleCat(c)}
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                px: 1.25,
                border: "1px solid #007560",
                bgcolor: active ? "#007560" : "transparent",
                color: active ? "#fff" : "inherit",
              }}
            />
          );
        })}
        <Chip
          label="Reset"
          onClick={onReset}
          clickable
          sx={{
            borderRadius: 999,
            fontWeight: 600,
            border: "1px solid #007560",
            bgcolor: "#007560",
            color: "#fff",
            "&:hover": { bgcolor: "#00614e" },
            ml: "auto",
          }}
        />
      </Stack>

      {/* toggle row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: space(2) }}>
        <ToggleButtonGroup
          exclusive
          value={consultType}
          onChange={(_, v) => v && onConsultTypeChange(v)}
          sx={{ flexShrink: 0 }}
        >
          {["in-person", "online", "all"].map((v) => (
            <ToggleButton
              key={v}
              value={v}
              sx={{
                textTransform: "none",
                px: { xs: 2, sm: 4 },
                fontWeight: 600,
                borderRadius: 999,
                border: "1px solid #007560 !important",
                color: "#007560",
                "&.Mui-selected": {
                  bgcolor: "#007560",
                  color: "#fff",
                  "&:hover": { bgcolor: "#00614e" },
                },
              }}
            >
              {v === "in-person"
                ? "In-Person"
                : v === "online"
                ? "Online"
                : "Show All"}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Chip
          label={showUnavailable ? "Showing All" : "Hide Unavailable"}
          clickable
          onClick={onToggleUnavailable}
          sx={{
            ml: "auto",
            borderRadius: 999,
            fontWeight: 600,
            px: 2,
            border: "1px solid #007560",
            bgcolor: showUnavailable ? "transparent" : "#007560",
            color: showUnavailable ? "#000" : "#fff",
            "&:hover": {
              bgcolor: showUnavailable ? "#f1faf8" : "#00614e",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default FilterBar;
