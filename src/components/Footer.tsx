import React from "react";
import Link from "next/link";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";

const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{ bgcolor: "#002a23", color: "common.white", py: 6 }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Logo */}
        <Grid item xs={12} md={3}>
          <Link href="/" passHref>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                cursor: "pointer",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#C35200", mr: 0.5 }}
              >
                FIT
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                NUTRITION
              </Typography>
            </Box>
          </Link>
        </Grid>

        {/* Static link columns */}
        <Grid item xs={12} sm={6} md={2}>
          <FooterColumn
            title="Navigation"
            items={["Recipes", "Meal Planning", "Bookings", "Clients"]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FooterColumn
            title="Account & Settings"
            items={["Profile Settings", "Subscription & Billing"]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <FooterColumn
            title="Support & Help"
            items={["Help Center", "Contact Support", "Report a Bug"]}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FooterColumn
            title="Legal & Compliance"
            items={[
              "Privacy Policy",
              "Terms of Service",
              "Data Security & GDPR",
            ]}
          />
        </Grid>
      </Grid>

      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "center", mt: 4 }}
      >
        © {new Date().getFullYear()} Fit Nutrition. All rights reserved. FitNutrition is a Work in Progress, and fitnutrition.ist is it's demo.
      </Typography>
    </Container>
  </Box>
);

export default Footer;

/* ---------- small helper ---------- */
const FooterColumn: React.FC<{ title: string; items: string[] }> = ({
  title,
  items,
}) => (
  <Stack spacing={1}>
    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    {items.map((it) => (
      <Typography key={it} variant="body2" color="grey.400">
        {it}
      </Typography>
    ))}
  </Stack>
);
