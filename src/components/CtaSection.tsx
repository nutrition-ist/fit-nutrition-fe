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
  py = { xs: 6, md: 8 },
}) => (
  <Box sx={{ bgcolor, py }}>
    <Container maxWidth="md" sx={{ textAlign: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        {title}
      </Typography>

      {paragraphs.map((p, i) => (
        <Typography
          key={i}
          variant="h6"
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
            variant="contained"
            size="large"
            sx={{
              textTransform: "none",
              bgcolor: "#007560",
              borderRadius: 8,
              px: 5,
              py: 2.5,
              fontSize: "1.125rem",
              ":hover": { bgcolor: "#00614e" },
            }}
            endIcon={<ArrowForwardIcon />}
          >
            {primary.label}
          </Button>
        </Link>

        {/* secondary button */}
        {secondary && (
          <Link href={secondary.href} passHref>
            <Button
              variant="outlined"
              size="large"
              sx={{
                textTransform: "none",
                borderRadius: 8 ,
                px: 5,
                py: 2.5,
                fontSize: "1.125rem",
                borderColor: "#007560",
                color: "#007560",
                ":hover": { borderColor: "#00614e", color: "#00614e" },
              }}
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
