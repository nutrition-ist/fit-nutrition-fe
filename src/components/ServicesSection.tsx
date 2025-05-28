/* app/(wherever)/ServicesSection.tsx */
import React, { FC } from "react";
import { Box, Container, Typography, Grid, GlobalStyles } from "@mui/material";

/* adjust the import path so it points at your file structure */
import ServiceCard, { ServiceCardProps } from "@/components/ServiceCard";

/** Props for this section */
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
  <>
    {/* ① Local overrides – only touch cards INSIDE this section */}
    <GlobalStyles
      styles={{
        ".services-section .MuiCardMedia-root": {
          height: 160, // larger image
        },
        ".services-section .MuiCardContent-root .MuiTypography-root": {
          fontSize: "1rem", // larger caption
          fontWeight: 600,
        },
      }}
    />

    {/* ② Section markup */}
    <Box className="services-section" sx={{ bgcolor, py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
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
  </>
);

export default ServicesSection;
