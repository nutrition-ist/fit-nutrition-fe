import React, { FC } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export interface CtaButton {
  label: string;
  href: string;
  variant?: "contained" | "outlined" | "text";
  sx?: SxProps<Theme>;
  endIcon?: React.ReactNode;
}

export interface CtaSectionProps {
  title: string;
  paragraphs?: string[]; // up to 2‑3 short lines of copy
  primary: CtaButton;
  secondary?: CtaButton; // optional secondary link
  bgcolor?: string; // default transparent
  py?: { xs: number; md: number };
}

const CtaSection: FC<CtaSectionProps> = ({
  title,
  paragraphs = [],
  primary,
  secondary,
  bgcolor = "transparent",
  py = { xs: 8, md: 10 },
}) => (
  <Box sx={{ bgcolor, py }}>
    <Container maxWidth="md" sx={{ textAlign: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {title}
      </Typography>

      {paragraphs.map((p, i) => (
        <Typography
          key={i}
          variant={i === 0 ? "h6" : "subtitle1"}
          sx={{
            mb: 3,
            maxWidth: 600,
            mx: "auto",
            fontWeight: i === 0 ? 400 : 600,
          }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        {/* primary button */}
        <Link href={primary.href} passHref>
          <Button
            variant={primary.variant ?? "contained"}
            size="large"
            endIcon={
              primary.endIcon ??
              (primary.variant === "contained" ? (
                <ArrowForwardIcon />
              ) : undefined)
            }
            sx={{
              bgcolor: primary.variant === "contained" ? "#007560" : undefined,
              borderRadius: 4,
              px: 4,
              ":hover":
                primary.variant === "contained"
                  ? { bgcolor: "#00614e" }
                  : undefined,
              ...primary.sx,
            }}
          >
            {primary.label}
          </Button>
        </Link>

        {/* secondary button */}
        {secondary && (
          <Link href={secondary.href} passHref>
            <Button
              variant={secondary.variant ?? "outlined"}
              size="large"
              sx={{ px: 4, borderRadius: 4, ...secondary.sx }}
            >
              {secondary.label}
            </Button>
          </Link>
        )}
      </Stack>
    </Container>
  </Box>
);

export default CtaSection;
