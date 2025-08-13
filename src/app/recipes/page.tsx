"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchBar from "@/components/SearchBar";
import RecipeList, { Recipe } from "@/components/RecipeList";
import RecipeDetail from "@/components/RecipeDetail";
import QuickCategoryGrid from "@/components/QuickCategoryGrid";

/* filters */
const DIETS = [
  "Vegan",
  "Vegetarian",
  "Keto",
  "Paleo",
  "Low Carb",
  "High Protein",
  "Gluten-free",
  "Dairy-free",
];
const ALLERGIES = [
  "Peanut",
  "Tree Nut",
  "Soy",
  "Dairy",
  "Fish",
  "Shellfish",
  "Mustard",
  "Sesame",
  "Egg",
  "Gluten",
  "Sulfite",
  "Celery",
];

type View = "home" | "search" | "category" | "detail";

export default function RecipesPage() {
  // query and selection
  const [query, setQuery] = useState("");
  const [userStartedSearch, setUserStartedSearch] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  // calories: hidden until user adjusts
  const FULL_CAL_RANGE: [number, number] = [0, 1000];
  const [calorieRange, setCalorieRange] =
    useState<[number, number]>(FULL_CAL_RANGE);
  const [calorieDirty, setCalorieDirty] = useState(false);

  // other filters
  const [showAIOnly, setShowAIOnly] = useState(false); // placeholder
  const [selectedTime, setSelectedTime] = useState<number | null>(null); // UI only
  const [dietSel, setDietSel] = useState<string[]>([]);
  const [allergySel, setAllergySel] = useState<string[]>([]);

  // compute view
  const view: View = selected
    ? "detail"
    : activeTag
    ? "category"
    : userStartedSearch || dietSel.length || allergySel.length
    ? "search"
    : "home";

  /* parse URL once */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q") ?? "";
    const tag = sp.get("tag");
    const diets = sp.get("diets");
    const allergies = sp.get("allergies");
    const cal = sp.get("cal");
    const rid = sp.get("r");

    if (q) {
      setQuery(q);
      setUserStartedSearch(true);
    }
    if (tag) setActiveTag(tag);
    if (diets) setDietSel(diets.split(",").filter(Boolean));
    if (allergies) setAllergySel(allergies.split(",").filter(Boolean));
    if (cal) {
      const [a, b] = cal.split("-").map((n) => parseInt(n, 10));
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        setCalorieRange([a, b]);
        setCalorieDirty(true);
      }
    }

    if (rid) {
      fetch("/last_30_recipes.json")
        .then((r) => r.json())
        .then((data: Recipe[]) => {
          const found = data.find((x) => String(x.id) === rid);
          if (found) setSelected(found);
        });
    }
  }, []);

  /* sync URL */
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query.trim()) sp.set("q", query.trim());
    if (activeTag) sp.set("tag", activeTag);
    if (dietSel.length) sp.set("diets", dietSel.join(","));
    if (allergySel.length) sp.set("allergies", allergySel.join(","));
    if (calorieDirty) sp.set("cal", `${calorieRange[0]}-${calorieRange[1]}`);
    if (selected) sp.set("r", String(selected.id));
    const qs = sp.toString();
    const url = qs ? `?${qs}` : location.pathname;
    window.history.replaceState(null, "", url);
  }, [
    query,
    activeTag,
    dietSel,
    allergySel,
    calorieRange,
    calorieDirty,
    selected,
  ]);

  /* detail view */
  if (view === "detail" && selected) {
    return <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <Box>
      {/* persistent hero with a controlled SearchBar */}
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
            value={query}
            onSearch={(q) => {
              setQuery(q);
              setUserStartedSearch(true);
              // new searches default to unlimited calories until the user adjusts
              setCalorieDirty(false);
              setCalorieRange(FULL_CAL_RANGE);
            }}
            onChangeText={(v) => {
              // detect starting a search from empty
              const starting = query.length === 0 && v.length === 1;
              setQuery(v);
              if (starting && !userStartedSearch) {
                setUserStartedSearch(true);
                setCalorieDirty(false);
                setCalorieRange(FULL_CAL_RANGE);
              }
              // if cleared to empty, stay in search view and show all
              if (v.length === 0) {
                setCalorieDirty(false);
                setCalorieRange(FULL_CAL_RANGE);
              }
            }}
          />
        </Container>
      </Box>

      {/* landing content */}
      {view === "home" && (
        <QuickCategoryGrid onSelect={(tag) => setActiveTag(tag)} />
      )}

      {/* search or category layout */}
      {(view === "search" || view === "category") && (
        <>
          {/* chips row */}
          <Container sx={{ mt: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              {selectedTime && (
                <Chip
                  label={`${selectedTime} min`}
                  onDelete={() => setSelectedTime(null)}
                />
              )}
              {calorieDirty && ( // hide until user adjusts
                <Chip
                  label={`${calorieRange[0]}-${calorieRange[1]} kcal`}
                  onDelete={() => {
                    setCalorieDirty(false);
                    setCalorieRange(FULL_CAL_RANGE);
                  }}
                />
              )}
              {dietSel.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  onDelete={() => setDietSel((x) => x.filter((y) => y !== d))}
                />
              ))}
              {allergySel.map((a) => (
                <Chip
                  key={a}
                  label={`${a} allergy`}
                  onDelete={() =>
                    setAllergySel((x) => x.filter((y) => y !== a))
                  }
                />
              ))}
              {(activeTag ||
                selectedTime ||
                dietSel.length ||
                allergySel.length ||
                showAIOnly ||
                calorieDirty) && (
                <Chip
                  label="Clear filters"
                  onClick={() => {
                    setSelectedTime(null);
                    setDietSel([]);
                    setAllergySel([]);
                    setActiveTag(null);
                    setShowAIOnly(false);
                    setCalorieDirty(false);
                    setCalorieRange(FULL_CAL_RANGE);
                  }}
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              {`${visibleCount} results for '${
                query.trim() || activeTag || "all"
              }'`}
            </Typography>
          </Container>

          <Container sx={{ py: 2 }}>
            <Grid container spacing={3}>
              {/* left sidebar */}
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filters
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAIOnly}
                      onChange={(e) => setShowAIOnly(e.target.checked)}
                    />
                  }
                  label="Show AI generated recipes"
                />

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Cooking Time</Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  {[15, 30, 45, 60].map((m) => (
                    <Chip
                      key={m}
                      label={`${m} min`}
                      variant={selectedTime === m ? "filled" : "outlined"}
                      color={selectedTime === m ? "primary" : "default"}
                      onClick={() =>
                        setSelectedTime((v) => (v === m ? null : m))
                      }
                    />
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Calories</Typography>
                <Slider
                  value={calorieRange}
                  onChange={(_, v) => {
                    setCalorieRange(v as [number, number]);
                    setCalorieDirty(true); // begin applying and exposing to URL
                  }}
                  valueLabelDisplay="auto"
                  min={FULL_CAL_RANGE[0]}
                  max={FULL_CAL_RANGE[1]}
                  step={50}
                />

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Diet Type</Typography>
                <FormGroup>
                  {DIETS.map((d) => (
                    <FormControlLabel
                      key={d}
                      control={
                        <Checkbox
                          checked={dietSel.includes(d)}
                          onChange={(e) =>
                            setDietSel((prev) =>
                              e.target.checked
                                ? [...prev, d]
                                : prev.filter((x) => x !== d)
                            )
                          }
                        />
                      }
                      label={d}
                    />
                  ))}
                </FormGroup>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Allergies</Typography>
                <FormGroup>
                  {ALLERGIES.map((a) => (
                    <FormControlLabel
                      key={a}
                      control={
                        <Checkbox
                          checked={allergySel.includes(a)}
                          onChange={(e) =>
                            setAllergySel((prev) =>
                              e.target.checked
                                ? [...prev, a]
                                : prev.filter((x) => x !== a)
                            )
                          }
                        />
                      }
                      label={a}
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* results */}
              <Grid item xs={12} md={9}>
                <RecipeList
                  grid
                  globalOnly
                  // when query < 3 but user started search, pass empty to show all
                  searchQuery={
                    query.trim().length >= 3
                      ? query
                      : userStartedSearch
                      ? ""
                      : ""
                  }
                  tagFilter={activeTag}
                  onSelect={(r) => setSelected(r)}
                  calorieRange={calorieDirty ? calorieRange : undefined} // only filter when dirty
                  dietFilter={dietSel}
                  allergyFilter={allergySel}
                  onVisibleChange={(list) => setVisibleCount(list.length)}
                />
              </Grid>
            </Grid>
          </Container>

          <Container sx={{ pb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              size="small"
              onClick={() => {
                setActiveTag(null);
                setQuery("");
                setDietSel([]);
                setAllergySel([]);
                setSelectedTime(null);
                setUserStartedSearch(false); // back to landing
                setCalorieDirty(false);
                setCalorieRange(FULL_CAL_RANGE);
              }}
              sx={{ mt: 2 }}
            >
              Home
            </Button>
          </Container>
        </>
      )}
    </Box>
  );
}
