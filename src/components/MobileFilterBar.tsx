import React, { FC, useState } from "react";
import {
  SwipeableDrawer,
  Box,
  Fab,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export interface MobileFilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (c: string[]) => void;

  consultType: "in-person" | "online" | "all";
  onConsultTypeChange: (t: "in-person" | "online" | "all") => void;

  showUnavailable: boolean;
  onToggleUnavailable: () => void;
  onReset: () => void;
}

/* a compact drawer for phones */
const MobileFilterBar: FC<MobileFilterBarProps> = (props) => {
  const {
    categories,
    selectedCategories,
    onSelectCategories,
    consultType,
    onConsultTypeChange,
    showUnavailable,
    onToggleUnavailable,
    onReset,
  } = props;

  const th = useTheme();
  const [open, setOpen] = useState(false);

  const toggleCat = (c: string) =>
    onSelectCategories(
      selectedCategories.includes(c)
        ? selectedCategories.filter((x) => x !== c)
        : [...selectedCategories, c]
    );

  return (
    <>
      {/* floating action button */}
      {!open && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}
          onClick={() => setOpen(true)}
        >
          <FilterListIcon />
        </Fab>
      )}

      {/* bottom sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        PaperProps={{
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 2 },
        }}
      >
        <Box sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Filter Dietitians
          </Typography>

          {/* category chips */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ rowGap: 1, mb: 3 }}
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
          </Stack>

          {/* consult type toggle */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Consultation Type
          </Typography>
          <ToggleButtonGroup
            fullWidth
            exclusive
            value={consultType}
            onChange={(_, v) => v && onConsultTypeChange(v)}
            sx={{ mb: 3 }}
          >
            {["in-person", "online", "all"].map((v) => (
              <ToggleButton
                key={v}
                value={v}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  border: "1px solid #007560 !important",
                  color: "#007560",
                  "&.Mui-selected": {
                    bgcolor: "#007560",
                    color: th.palette.common.white,
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

          {/* hide unavailable + reset */}
          <Stack direction="row" spacing={2}>
            <Chip
              label={showUnavailable ? "Showing All" : "Hide Unavailable"}
              clickable
              onClick={onToggleUnavailable}
              sx={{
                flex: 1,
                borderRadius: 999,
                fontWeight: 600,
                border: "1px solid #007560",
                bgcolor: showUnavailable ? "transparent" : "#007560",
                color: showUnavailable ? "#000" : "#fff",
              }}
            />
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
              }}
            />
          </Stack>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default MobileFilterBar;
