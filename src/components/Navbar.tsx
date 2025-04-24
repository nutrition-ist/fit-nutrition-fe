"use client";

import React, { FC, useEffect, useState } from "react";
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
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter, usePathname } from "next/navigation";

export type Role = "visitor" | "patient" | "dietitian";

export interface NavbarProps {
  role?: Role; //istenilen Role sokmak icin
  logo?: { primary: string; secondary: string; href?: string };
  bgcolor?: string;
}
interface RoleConfig {
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
}

/* Role → links / CTA map */
const cfg: Record<Role, RoleConfig> = {
  visitor: {
    links: [
      { label: "Find a Dietitian", href: "/dietitian" },
      { label: "Blog", href: "/wip" },
      { label: "Login", href: "/login" },
    ],
    cta: { label: "Are you a Dietitian?", href: "/register" },
  },
  patient: {
    links: [
      { label: "Dashboard", href: "/patient-dashboard" },
      { label: "Dietitians", href: "/dietitian" },
      { label: "Recipes", href: "/recipes" },
    ],
  },
  dietitian: {
    links: [
      { label: "Dashboard", href: "/dietitian-dashboard" },
      { label: "Dietitians", href: "/dietitian" },
      { label: "Recipes", href: "/recipes" },
    ],
  },
} as const;

const Navbar: FC<NavbarProps> = ({
  role: roleProp,
  logo = { primary: "FIT", secondary: "NUTRITION", href: "/" },
  bgcolor = "#002a23",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("visitor");

  useEffect(() => {
    const deriveRoleFromPath = (): Role => {
      if (pathname?.startsWith("/dietitian-dashboard")) return "dietitian";
      if (pathname?.startsWith("/patient-dashboard")) return "patient"; //logine patienti koyunca bu aktif olcak
      return "visitor";
    };

    if (roleProp) {
      setRole(roleProp);
      return;
    }

    const storedRole = localStorage.getItem("role") as Role | null;
    const access = localStorage.getItem("accessToken");

    if (storedRole && access) {
      setRole(storedRole);
      setUserName(localStorage.getItem("username"));
    } else {
      setRole(deriveRoleFromPath());
    }
  }, [roleProp, pathname]);

  const { links, cta } = cfg[role];

  const logout = () => {
    ["accessToken", "refreshToken", "username", "role"].forEach((k) =>
      localStorage.removeItem(k)
    );
    router.push("/login");
  };

  /* Drawer (mobile) */
  const drawer = (
    <Box
      sx={{ width: 260 }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
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
        {role !== "visitor" && (
          <ListItemButton onClick={logout}>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ sx: { fontWeight: 600 } }}
            />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor }}>
        <Toolbar sx={{ minHeight: { xs: 56, md: 72 }, px: { xs: 2, md: 3 } }}>
          {/* Logo */}
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

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop navigation */}
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

            {role !== "visitor" && (
              <>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {userName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ color: "white", mx: 1 }}>
                  {userName}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={logout}
                  sx={{
                    borderColor: "rgba(255,255,255,0.7)",
                    color: "white",
                    ":hover": { borderColor: "white" },
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Stack>

          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { md: "none" } }}
            onClick={() => setDrawerOpen(true)}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
