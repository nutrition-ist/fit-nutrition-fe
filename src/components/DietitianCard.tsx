import React, { FC, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import VideocamIcon from "@mui/icons-material/Videocam";
import placeholder from "../../public/images/placeholder.jpg";

/* ---------- props ---------- */
export interface Dietitian {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  about_me?: string;
  qualifications: string[];
  available?: boolean;
  next_available_date?: string;
  online_booking?: boolean;
}

export interface DietitianCardProps {
  dietitian: Dietitian;
}

/* ---------- component ---------- */
const DietitianCard: FC<DietitianCardProps> = ({ dietitian }) => {
  /* availability badge */
  const badgeText = useMemo(() => {
    if (dietitian.available === false) return null;
    if (dietitian.next_available_date) {
      const d = new Date(dietitian.next_available_date);
      return `Available on ${d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}`;
    }
    return "Available";
  }, [dietitian.available, dietitian.next_available_date]);

  /* qualification chip logic */
  const firstTwo = dietitian.qualifications.slice(0, 2);
  const extra = dietitian.qualifications.length - firstTwo.length;

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.12)",
        bgcolor: "#e6f1ef",
      }}
    >
      {/* ---------- header ---------- */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          maxHeight: 42,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {dietitian.first_name} {dietitian.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Dietitian
          </Typography>
        </Box>

        {badgeText && (
          <Chip
            label={badgeText}
            size="small"
            icon={
              dietitian.next_available_date ? (
                <CalendarTodayIcon sx={{ fontSize: 16 }} />
              ) : (
                <CheckIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{ bgcolor: "#c9e7dd", fontWeight: 600 }}
          />
        )}
      </Box>

      {/* ---------- image ---------- */}
      <Image
        src={
          dietitian.profile_picture
            ? `https://hazalkaynak.pythonanywhere.com/${dietitian.profile_picture}`
            : placeholder
        }
        alt={`${dietitian.first_name} ${dietitian.last_name}`}
        width={600}
        height={600}
        unoptimized
        style={{ width: "100%", height: 220, objectFit: "cover" }}
      />

      {/* ---------- body ---------- */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* qualifications */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            mb: 2,
            maxHeight: 52, // two rows max
            minHeight: 52,
            overflow: "hidden",
          }}
        >
          {firstTwo.map((q) => (
            <Chip
              key={q}
              label={q}
              size="small"
              sx={{
                height: 26,
                borderRadius: 0,
                fontWeight: 600,
                bgcolor: "#ffffff",
              }}
            />
          ))}

          {extra > 0 && (
            <Tooltip
              arrow
              placement="top"
              title={
                <Stack spacing={0.5}>
                  {dietitian.qualifications.map((q) => (
                    <Typography key={q} variant="body2">
                      • {q}
                    </Typography>
                  ))}
                </Stack>
              }
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#ffffff",
                    color: "#333",
                    border: "1px solid #ccc",
                    boxShadow: 3,
                    p: 1,
                  },
                },
              }}
            >
              <Chip
                label={`+${extra}`}
                size="small"
                sx={{
                  height: 26,
                  borderRadius: 0,
                  fontWeight: 600,
                  bgcolor: "#007560",
                  color: "#fff",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          )}
        </Stack>

        {/* about text */}
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            minHeight: 68, // ≈ 3 lines
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {dietitian.about_me ??
            "Specialising in holistic nutrition to support overall well-being."}
        </Typography>

        {/* ---------- CTAs ---------- */}
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#007560",
              ":hover": { bgcolor: "#00614e" },
              borderRadius: 4,
            }}
            href={`/dietitian/${dietitian.username}?book=in-person`}
          >
            Book an Appointment
          </Button>

          {dietitian.online_booking !== false && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VideocamIcon />}
              sx={{ borderRadius: 4 }}
              href={`/dietitian/${dietitian.username}?book=online`}
            >
              Book an Online Appointment
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DietitianCard;
