"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

export interface BlogPostSummary {
  id: number | string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
  read_minutes?: number;
  cover_image?: string | null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

type Props = {
  post: BlogPostSummary;
  href?: string;
  onOpen?: () => void;
};

const BlogCard: React.FC<Props> = ({ post, href, onOpen }) => {
  const minutes =
    post.read_minutes ??
    Math.max(1, Math.round((post.summary || "").split(/\s+/).length / 200));

  const targetHref = href ?? `/blog?p=${encodeURIComponent(post.slug)}`;

  const CardInner = (
    <CardActionArea
      sx={{ height: "100%" }}
      onClick={(e) => {
        if (onOpen) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {post.cover_image && (
        <CardMedia
          component="img"
          src={post.cover_image}
          alt={post.title}
          sx={{ height: 200, objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {post.summary}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
          {post.tags.map((t) => (
            <Chip key={t} label={t} size="small" />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {formatDate(post.created_at)} · {minutes} min read
        </Typography>
      </CardContent>
    </CardActionArea>
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.12)",
        bgcolor: "background.paper",
      }}
    >
      <Link href={targetHref} style={{ textDecoration: "none" }}>
        {CardInner}
      </Link>
    </Card>
  );
};

export default BlogCard;
