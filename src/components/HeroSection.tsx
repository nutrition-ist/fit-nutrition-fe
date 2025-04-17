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
      minHeight: { xs: "60vh", md: "75vh" },
      display: "flex",
      alignItems: "center",
      color: "common.white",
      background: `linear-gradient(${overlay}, ${overlay}), url('${bgImage}') center/cover`,
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ maxWidth: 620 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="h6" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flexGrow: 1, maxWidth: 420 }}>
            <SearchBar {...searchBarProps} />
          </Box>
          {primaryCta && (
            <Link href={primaryCta.href} passHref>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#007560",
                  height: 56,
                  borderRadius: 4,
                  px: 4,
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
