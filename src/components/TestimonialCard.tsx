// "use client";  ← not needed; only Carousel uses hooks

import React, { FC } from "react";
import { Avatar, Card, Stack, Typography } from "@mui/material";

export interface TestimonialCardProps {
  img: string;
  name: string;
  quote: string;
}

const TestimonialCard: FC<TestimonialCardProps> = ({ img, name, quote }) => (
  <Card
    elevation={0}
    sx={{
      bgcolor: "rgba(255,255,255,0.9)",
      maxWidth: 340,
      mx: "auto",
      textAlign: "center",
      px: 2,
      py: 4,
      borderRadius: 3,
    }}
  >
    <Stack spacing={2} alignItems="center">
      <Avatar src={img} alt={name} sx={{ width: 100, height: 100 }} />
      <Typography variant="body1" sx={{ fontStyle: "normal" }}>
        “{quote}”
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {name}
      </Typography>
    </Stack>
  </Card>
);

export default TestimonialCard;
