import React from "react";
import { Stack, Typography, Box } from "@mui/material";

export interface MetricCardProps {
  value: string;
  label: string;
  caption?: string;
  icon?: React.ReactNode;   // KEEP this line
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, caption, icon }) => (
  <Stack spacing={1} alignItems="center" sx={{ textAlign: "center" }}>
    {icon && <Box>{icon}</Box>}             {/* ← renders the image */}
    <Typography variant="h4" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    {caption && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220 }}>
        {caption}
      </Typography>
    )}
  </Stack>
);

export default MetricCard;
