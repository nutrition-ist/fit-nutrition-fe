import React, { FC } from "react";
import {
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Container,
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

  bgcolor?: string;
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
  bgcolor = "#e6f1ef",
}) => {
  const th = useTheme();

  const toggleCat = (cat: string) =>
    onSelectCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat]
    );

  return (
    <Box sx={{ bgcolor, py: { xs: 3, md: 4 }, mb: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* ---------- title ---------- */}
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: "center", mb: 3 }}
        >
          Find the Right Expert
        </Typography>

        {/* ---------- category chips (wrap, left-aligned) ---------- */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="flex-start"
          sx={{ mb: 3 }}
        >
          {categories.map((cat) => {
            const active = selectedCategories.includes(cat);
            return (
              <Chip
                key={cat}
                label={cat}
                clickable
                onClick={() => toggleCat(cat)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  px: 1.5,
                  border: "1px solid #007560",
                  bgcolor: active ? "#007560" : "transparent",
                  color: active
                    ? th.palette.common.white
                    : th.palette.text.primary,
                  "&:hover": {
                    bgcolor: active ? "#00614e" : "rgba(0,118,96,0.08)",
                  },
                }}
              />
            );
          })}

          {/* utility chips */}
          <Chip
            label="See All Categories"
            variant="outlined"
            clickable
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #007560",
              mr: 1,
              mt: 1,
            }}
          />

          <Chip
            label="Reset Filters"
            clickable
            onClick={onReset}
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #007560",
              bgcolor: "#007560",
              color: th.palette.common.white,
              "&:hover": { bgcolor: "#00614e" },
              mt: 1,
            }}
          />
        </Stack>

        {/* ---------- toggle row ---------- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // left-start & right-end
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* left segment toggle */}
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
                disableRipple
                sx={{
                  textTransform: "none",
                  px: 4,
                  fontWeight: 600,
                  borderRadius: 999,
                  border: "1px solid #007560",
                  color: "#007560",
                  "&.Mui-selected": {
                    bgcolor: "#007560",
                    color: th.palette.common.white,
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

          {/* right pill */}
          <Chip
            label={
              showUnavailable ? "Showing All" : "Hide Unavailable Dietitians"
            }
            clickable
            onClick={onToggleUnavailable}
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              px: 2,
              border: "1px solid #007560",
              bgcolor: showUnavailable ? "transparent" : "#007560",
              color: showUnavailable
                ? th.palette.text.primary
                : th.palette.common.white,
              "&:hover": {
                bgcolor: showUnavailable ? "rgba(0,118,96,0.08)" : "#00614e",
              },
              ml: "auto",
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default FilterBar;
