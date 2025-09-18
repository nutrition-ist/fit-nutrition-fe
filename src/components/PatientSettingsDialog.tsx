"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
  TextField,
} from "@mui/material";

/* Shared const olsa iyi mi olur acaba */
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

export interface PatientPrefsPayload {
  allergies: string[];
  diets: string[];
  notes?: string;
}

export interface PatientSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: PatientPrefsPayload) => Promise<void> | void;
}

const LOCAL_KEY = "patient_prefs_v1";

const PatientSettingsDialog: React.FC<PatientSettingsDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    try {
      const parsed: PatientPrefsPayload = JSON.parse(raw);
      setAllergies(parsed.allergies ?? []);
      setDiets(parsed.diets ?? []);
      setNotes(parsed.notes ?? "");
    } catch {
      // ignore
    }
  }, [open]);

  const saveLocal = () => {
    const payload: PatientPrefsPayload = { allergies, diets, notes };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
    return payload;
  };

  const handleSave = async () => {
    const payload = saveLocal();
    await onSave?.(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Management</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Box mb={1}>Allergies</Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {ALLERGIES.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  color={allergies.includes(a) ? "primary" : "default"}
                  variant={allergies.includes(a) ? "filled" : "outlined"}
                  onClick={() =>
                    setAllergies((prev) =>
                      prev.includes(a)
                        ? prev.filter((x) => x !== a)
                        : [...prev, a]
                    )
                  }
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Box mb={1}>Diet preferences</Box>
            <Stack>
              {DIETS.map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={diets.includes(d)}
                      onChange={(e) =>
                        setDiets((prev) =>
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
            </Stack>
          </Box>

          <Divider />

          <TextField
            label="Notes for your dietitian"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={3}
            placeholder="Anything important we should know"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientSettingsDialog;
