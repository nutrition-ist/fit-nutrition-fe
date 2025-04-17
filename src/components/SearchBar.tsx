"use client";

import React, { FC, useState, KeyboardEvent } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

const SearchBar: FC<SearchBarProps> = ({
  placeholder = "Search…",
  onSearch,
  defaultValue = "",
}) => {
  const [query, setQuery] = useState(defaultValue);

  const triggerSearch = () => {
    onSearch?.(query.trim());
  };

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
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
