import React, { FC } from "react";
import Link from "next/link";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import SearchBar, { SearchBarProps } from "./SearchBar";

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  bgImage: string;
  overlay?: string;
  searchBarProps?: SearchBarProps;
  primaryCta?: { label: string; href: string };
}

const HeroSection: FC<HeroSectionProps> = ({
  title,
  subtitle,
  bgImage,
  overlay = "rgba(0,0,0,.55)",
  searchBarProps,
  primaryCta,
}) => (
  <Box
    sx={{
      position: "relative",
      minHeight: { xs: "50vh", md: "60vh" },
      display: "flex",
      alignItems: "center",
      color: "common.white",
      background: `linear-gradient(${overlay}, ${overlay}), url('${bgImage}') center/cover`,
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: 620 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            lineHeight: 1.1,
            whiteSpace: { md: "nowrap" },
            fontSize: { xs: "2.2rem", md: "3.5rem" },
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="h5" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flexGrow: 1, maxWidth: 420, borderRadius: 4 }}>
            <SearchBar {...searchBarProps} />
          </Box>
          {primaryCta && (
            <Link href={primaryCta.href} passHref>
              <Button
                variant="contained"
                size="large"
                sx={{
                  textTransform: "none",
                  bgcolor: "#007560",
                  height: 56,
                  borderRadius: 8,
                  px: 5,
                  ":hover": { bgcolor: "#00614e" },
                }}
              >
                {primaryCta.label}
              </Button>
            </Link>
          )}
        </Stack>
      </Box>
    </Container>
  </Box>
);

export default HeroSection;
