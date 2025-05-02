import React, { FC } from "react";
import { ToggleButton, ToggleButtonGroup, Box } from "@mui/material";

export type ConsultType = "in-person" | "online" | "all";

export interface ConsultTypeToggleProps {
  value: ConsultType;
  onChange: (value: ConsultType) => void;
}

const ConsultTypeToggle: FC<ConsultTypeToggleProps> = ({ value, onChange }) => (
  <Box sx={{ width: "100%", my: 2, display: "flex", justifyContent: "center" }}>
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, v: ConsultType | null) => v && onChange(v)}
      color="primary"
      sx={{
        "& .MuiToggleButton-root": {
          textTransform: "none",
          px: 4,
          fontWeight: 600,
        },
      }}
    >
      <ToggleButton value="in-person">In-Person</ToggleButton>
      <ToggleButton value="online">Online</ToggleButton>
      <ToggleButton value="all">Show All</ToggleButton>
    </ToggleButtonGroup>
  </Box>
);

export default ConsultTypeToggle;
