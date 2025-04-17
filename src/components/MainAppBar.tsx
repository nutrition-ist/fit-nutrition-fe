"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export interface NavLink {
  label: string;
  href: string;
}

export interface CtaButton {
  label: string;
  href: string;
}

export interface LogoText {
  primary: string; // coloured part
  secondary: string; // white part
  href?: string; // defaults to "/"
}

export interface MainAppBarProps {
  links: NavLink[];
  cta?: CtaButton; // optional pill on the right
  logo?: LogoText; // allows re‑branding if needed
  bgcolor?: string;
}

const MainAppBar: FC<MainAppBarProps> = ({
  links,
  cta = { label: "Are you a Dietitian?", href: "/register" },
  logo = { primary: "FIT", secondary: "NUTRITION", href: "/" },
  bgcolor = "#002a23",
}) => {
  const [open, setOpen] = useState(false);

  const drawer = (
    <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
      <List>
        {links.map(({ label, href }) => (
          <Link key={href} href={href} passHref>
            <ListItemButton component="a">
              <ListItemText primary={label} />
            </ListItemButton>
          </Link>
        ))}
        {cta && (
          <Link href={cta.href} passHref>
            <ListItemButton component="a">
              <ListItemText
                primary={cta.label}
                primaryTypographyProps={{ sx: { fontWeight: 600 } }}
              />
            </ListItemButton>
          </Link>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor }}>
        <Toolbar sx={{ minHeight: { xs: 56, md: 72 }, px: { xs: 2, md: 3 } }}>
          {/* ─────────── Logo ─────────── */}
          <Link href={logo.href ?? "/"} passHref>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                cursor: "pointer",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#C35200", mr: 0.5 }}
              >
                {logo.primary}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {logo.secondary}
              </Typography>
            </Box>
          </Link>

          {/* grow */}
          <Box sx={{ flexGrow: 1 }} />

          {/* ─────────── Desktop nav ─────────── */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {links.map(({ label, href }) => (
              <Link key={href} href={href} passHref>
                <Button
                  sx={{
                    color: "common.white",
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </Button>
              </Link>
            ))}
            {cta && (
              <Link href={cta.href} passHref>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#007560",
                    ":hover": { bgcolor: "#00614e" },
                  }}
                >
                  {cta.label}
                </Button>
              </Link>
            )}
          </Stack>

          {/* ─────────── Mobile hamburger ─────────── */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { md: "none" } }}
            onClick={() => setOpen(true)}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default MainAppBar;
