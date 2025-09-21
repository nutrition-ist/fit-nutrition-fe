"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Grid,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchBar from "@/components/SearchBar";
import RecipeList, { Recipe } from "@/components/RecipeList";

export type PlanItem = { label: string; recipe_id?: number };
export type PlanRow = { time: string; items: PlanItem[] };

type Props = {
  initialRows?: number;
  initialData?: PlanRow[]; // NEW: prefill existing rows
  ownerId?: number;
  onSave?: (rows: PlanRow[]) => void;
  onCancel?: () => void;
  onRowsChange?: (rows: PlanRow[]) => void; // NEW: lift state if desired
  hideFooter?: boolean; // NEW: embed without footer
};

const zeroPad = (n: number) => String(n).padStart(2, "0");

const MealPlanBuilder: React.FC<Props> = ({
  initialRows = 5,
  initialData,
  ownerId,
  onSave,
  onCancel,
  onRowsChange,
  hideFooter = false,
}) => {
  const [rows, setRows] = useState<PlanRow[]>(
    initialData && initialData.length
      ? initialData
      : Array.from({ length: initialRows }, (_, i) => ({
          time: `${zeroPad(Math.min(i * 3, 23))}:00`,
          items: [],
        }))
  );

  useEffect(() => {
    if (initialData) setRows(initialData);
  }, [initialData]);

  useEffect(() => {
    onRowsChange?.(rows);
  }, [rows, onRowsChange]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [recipeQuery, setRecipeQuery] = useState("");
  const [customText, setCustomText] = useState("");

  const addRow = () => setRows((r) => [...r, { time: "00:00", items: [] }]);

  const updateTime = (idx: number, value: string) =>
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, time: value } : row))
    );

  const openPickerFor = (idx: number) => {
    setActiveRow(idx);
    setRecipeQuery("");
    setCustomText("");
    setPickerOpen(true);
  };

  const addItemToActive = (item: PlanItem) => {
    if (activeRow == null) return;
    setRows((r) =>
      r.map((row, i) =>
        i === activeRow ? { ...row, items: [...row.items, item] } : row
      )
    );
  };

  const removeItem = (rowIdx: number, itemIdx: number) =>
    setRows((r) =>
      r.map((row, i) =>
        i === rowIdx
          ? { ...row, items: row.items.filter((_, j) => j !== itemIdx) }
          : row
      )
    );

  const totalItems = useMemo(
    () => rows.reduce((acc, r) => acc + r.items.length, 0),
    [rows]
  );

  return (
    <Box>
      {!hideFooter && (
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 2 }}>
          New Meal Plan
        </Typography>
      )}

      <Grid
        container
        spacing={1}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {rows.map((row, idx) => (
          <React.Fragment key={`row-${idx}`}>
            <Grid
              item
              xs={3}
              md={2}
              sx={{ borderRight: "1px solid", borderColor: "divider" }}
            >
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  value={row.time}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-2][0-9]:[0-5][0-9]",
                  }}
                  placeholder="HH:MM"
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={9}
              md={10}
              sx={{ borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Box sx={{ p: 1.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  {row.items.map((it, j) => (
                    <Chip
                      key={`${it.label}-${j}`}
                      label={it.label}
                      onDelete={() => removeItem(idx, j)}
                      deleteIcon={<DeleteOutlineIcon />}
                      sx={{ mb: 1 }}
                    />
                  ))}
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => openPickerFor(idx)}
                    sx={{ mb: 1 }}
                  >
                    Add item
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {!hideFooter && (
        <>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <IconButton onClick={addRow} color="primary">
              <AddIcon />
            </IconButton>
            <Typography>Add another line</Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={onCancel}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => onSave?.(rows)}
              disabled={totalItems === 0}
            >
              Save meal plan
            </Button>
          </Stack>
        </>
      )}

      <Dialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Add item</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">
              Search recipes
            </Typography>
            <SearchBar
              placeholder="Search recipes…"
              value={recipeQuery}
              onChangeText={setRecipeQuery}
            />
            <RecipeList
              ownerId={ownerId}
              globalOnly={false}
              grid
              limit={8}
              searchQuery={recipeQuery}
              onSelect={(r: Recipe) =>
                addItemToActive({ label: r.name, recipe_id: r.id })
              }
            />
            <Divider />
            <Typography variant="h6" component="h2">
              Or type a custom item
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="e.g., Omelette, Yogurt, Tea"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  const t = customText.trim();
                  if (!t) return;
                  addItemToActive({ label: t });
                  setCustomText("");
                }}
              >
                Add
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPickerOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealPlanBuilder;
