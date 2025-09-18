"use client";

import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export interface QuickActionsProps {
  dietitianId?: number;
  onOpenSettings: () => void;
}

type Action = {
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
};

const QuickActions: React.FC<QuickActionsProps> = ({
  dietitianId,
  onOpenSettings,
}) => {
  const actions: Action[] = [
    {
      title: "Meal plans",
      subtitle: "See your plans",
      icon: <LocalDiningOutlinedIcon />,
      href: "/patient/meal-plans",
    },
    {
      title: "Recipes",
      subtitle: "Search and explore",
      icon: <MenuBookOutlinedIcon />,
      href: "/recipes",
    },
    {
      title: "Blog",
      subtitle: "Latest articles",
      icon: <ArticleOutlinedIcon />,
      href: "/blog",
    },
    {
      title: "My dietitian",
      subtitle: dietitianId ? "View profile" : "Find a dietitian",
      icon: <PersonOutlineOutlinedIcon />,
      href: dietitianId ? `/dietitian/${dietitianId}` : "/find-a-dietitian",
    },
    {
      title: "Management",
      subtitle: "Allergies and account",
      icon: <SettingsOutlinedIcon />,
      onClick: onOpenSettings,
    },
  ];

  return (
    <Grid container spacing={2}>
      {actions.map((a) => (
        <Grid item xs={12} sm={6} key={a.title}>
          <Card variant="outlined">
            {a.href ? (
              <CardActionArea component="a" href={a.href}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {a.icon}
                    <BoxText title={a.title} subtitle={a.subtitle} />
                  </Stack>
                </CardContent>
              </CardActionArea>
            ) : (
              <CardActionArea onClick={a.onClick}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {a.icon}
                    <BoxText title={a.title} subtitle={a.subtitle} />
                  </Stack>
                </CardContent>
              </CardActionArea>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const BoxText: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <Stack>
    <Typography fontWeight={600}>{title}</Typography>
    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  </Stack>
);

export default QuickActions;
