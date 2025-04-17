import React, { FC } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import ServiceCard, { ServiceCardProps } from "./ServiceCard";

export interface ServicesSectionProps {
  items: ServiceCardProps[];
  title?: string;
  bgcolor?: string;
}

const ServicesSection: FC<ServicesSectionProps> = ({
  items,
  title = "Services",
  bgcolor = "transparent",
}) => (
  <Box sx={{ bgcolor, py: { xs: 6, md: 8 } }}>
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
      >
        {title}
      </Typography>

      <Grid container spacing={4}>
        {items.map((it) => (
          <Grid key={it.title} item xs={12} sm={6} md={3}>
            <ServiceCard {...it} />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default ServicesSection;
