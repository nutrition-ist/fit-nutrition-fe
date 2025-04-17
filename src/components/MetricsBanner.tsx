import React, { FC } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import MetricCard, { MetricCardProps } from "./MetricCard";

export interface MetricsBannerProps {
  items: MetricCardProps[];
  title?: string;
  bgcolor?: string;
  py?: { xs: number; md: number };
}

const MetricsBanner: FC<MetricsBannerProps> = ({
  items,
  title = "Trusted by the Nutrition Community",
  bgcolor = "transparent",
  py = { xs: 6, md: 8 },
}) => (
  <Box sx={{ bgcolor, py }}>
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
      >
        {title}
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {items.map((m) => (
          <Grid key={m.label} item xs={12} sm={4}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default MetricsBanner;
