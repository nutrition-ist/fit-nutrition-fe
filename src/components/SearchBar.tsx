"use client";

import React, { FC, useState, KeyboardEvent, useEffect } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  value?: string; // NEW: controlled mode
}

const SearchBar: FC<SearchBarProps> = ({
  placeholder = "Search…",
  onSearch,
  defaultValue = "",
  onChangeText,
  value, // NEW
}) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);

  // keep internal in sync when defaultValue changes and component is uncontrolled
  useEffect(() => {
    if (!isControlled) setInternal(defaultValue);
  }, [defaultValue, isControlled]);

  const current = isControlled ? value! : internal;

  const setValue = (v: string) => {
    if (!isControlled) setInternal(v);
    onChangeText?.(v);
  };

  const triggerSearch = () => onSearch?.(current.trim());

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerSearch();
  };

  return (
    <Box
      sx={{
        width: 1,
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: "none",
        "&:hover": { boxShadow: "0 1px 6px rgba(32,33,36,0.28)" },
        "& .MuiOutlinedInput-root": { borderRadius: 4 },
      }}
    >
      <TextField
        fullWidth
        value={current}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        variant="outlined"
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={triggerSearch} aria-label="search">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;
