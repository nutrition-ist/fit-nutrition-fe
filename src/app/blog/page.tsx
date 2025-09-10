"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
//import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import BlogCard, { BlogPostSummary } from "@/components/BlogCard";

type BlogPost = BlogPostSummary & {
  content_html?: string;
  content?: string;
};
/*Md dosyasından okunacak, BE gerek yok*/
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://hazalkaynak.pythonanywhere.com/";

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: 1,
    slug: "getting-started",
    title: "Getting started with Fitnutrition",
    summary:
      "A quick tour of habits, tools and recipes that move you from guesswork to a simple plan.",
    tags: ["Basics", "Guides"],
    created_at: new Date().toISOString(),
    read_minutes: 4,
    cover_image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
    content_html:
      "<p>Favour principles over hacks. Start with one constraint and layer slowly.</p><p>For example: add a palm of protein to lunch, two fists of veg to dinner. Track for two weeks, then iterate.</p>",
  },
  {
    id: 2,
    slug: "protein-traps",
    title: "Protein label traps to avoid",
    summary:
      "Not all grams are equal. How to spot poor quality proteins and make smarter swaps.",
    tags: ["Protein", "Labeling"],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    read_minutes: 6,
    cover_image:
      "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=1600&auto=format&fit=crop",
    content_html:
      "<p>Look past the gram count. Check leucine content and the ingredient list. Fewer fillers is usually better.</p>",
  },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const readingTime = (p: BlogPost) => {
  if (p.read_minutes) return p.read_minutes;
  const text =
    p.content_html?.replace(/<[^>]+>/g, " ") ?? p.content ?? p.summary;
  const words = text.trim().split(/\s+/).length || 1;
  return Math.max(1, Math.round(words / 200));
};

type View = "index" | "detail";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  const wantedSlugRef = useRef<string | null>(null);

  const view: View = selected ? "detail" : "index";

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q") ?? "";
    const tag = sp.get("tag");
    const p = sp.get("p");
    if (q) setQuery(q);
    if (tag) setActiveTag(tag);
    if (p) wantedSlugRef.current = p;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${API_BASE}blog/posts/`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = (await res.json()) as BlogPost[];
          setPosts(data);
        } else {
          try {
            const r2 = await fetch("/blog_posts.json", {
              signal: controller.signal,
            });
            if (!r2.ok) throw new Error(String(r2.status));
            const data2 = (await r2.json()) as BlogPost[];
            setPosts(data2);
          } catch {
            setPosts(SAMPLE_POSTS);
          }
        }
      } catch {
        setPosts(SAMPLE_POSTS);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!wantedSlugRef.current || posts.length === 0) return;
    const found = posts.find((p) => p.slug === wantedSlugRef.current) ?? null;
    if (found) setSelected(found);
    wantedSlugRef.current = null;
  }, [posts]);

  useEffect(() => {
    const sp = new URLSearchParams();
    const q = query.trim();
    if (q) sp.set("q", q);
    if (activeTag) sp.set("tag", activeTag);
    if (selected) sp.set("p", selected.slug);
    const qs = sp.toString();
    const url = qs ? `?${qs}` : location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, activeTag, selected]);

  const allTags = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [posts]);

  const filtered = useMemo(() => {
    let pool = posts;
    if (query.trim()) {
      const q = query.toLowerCase();
      pool = pool.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeTag) pool = pool.filter((p) => p.tags.includes(activeTag));
    return pool.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts, query, activeTag]);

  if (view === "detail" && selected) {
    return (
      <Box>
        <Container sx={{ py: 6, maxWidth: 900 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setSelected(null)}
            sx={{ mb: 2 }}
          >
            Back to all posts
          </Button>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            {selected.title}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {fmtDate(selected.created_at)} · {readingTime(selected)} min read
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap">
            {selected.tags.map((t) => (
              <Chip key={t} label={t} size="small" />
            ))}
          </Stack>

          {selected.cover_image && (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 220, md: 360 },
                mb: 3,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <img
                src={selected.cover_image}
                alt={selected.title}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                style={{ objectFit: "cover" }}
              />
            </Box>
          )}

          {selected.content_html ? (
            <Card variant="outlined">
              <CardContent
                sx={{
                  "& p": { mb: 2, lineHeight: 1.9, fontSize: "1.05rem" },
                  "& h2, & h3": { mt: 3, mb: 1.5, fontWeight: 800 },
                  "& ul": { pl: 3, mb: 2 },
                }}
                dangerouslySetInnerHTML={{ __html: selected.content_html }}
              />
            </Card>
          ) : (
            <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>
              {selected.content ?? selected.summary}
            </Typography>
          )}
        </Container>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: 900, letterSpacing: -0.5, mb: 2 }}
        >
          Blog
        </Typography>
        <Typography color="text.secondary">
          Essays, guides, and field notes on nutrition, behaviour, and better
          eating.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <SearchBar
          placeholder="Search articles…"
          defaultValue={query}
          onSearch={setQuery}
          onChangeText={(v) => setQuery(v)}
        />
      </Box>

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        sx={{ mt: 2, justifyContent: "center" }}
      >
        {allTags.map((t) => (
          <Chip
            key={t}
            label={t}
            clickable
            color={activeTag === t ? "primary" : "default"}
            variant={activeTag === t ? "filled" : "outlined"}
            onClick={() => setActiveTag((prev) => (prev === t ? null : t))}
          />
        ))}
        {(activeTag || query) && (
          <Chip
            label="Clear"
            onClick={() => {
              setActiveTag(null);
              setQuery("");
            }}
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}
      </Stack>

      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress />
          </Box>
        ) : err ? (
          <Typography color="error" textAlign="center">
            {err}
          </Typography>
        ) : filtered.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" py={6}>
            No posts found.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.slug}>
                <BlogCard
                  post={p}
                  href={`?${new URLSearchParams({
                    ...(query.trim() ? { q: query.trim() } : {}),
                    ...(activeTag ? { tag: activeTag } : {}),
                    p: p.slug,
                  }).toString()}`}
                  onOpen={() => setSelected(p)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
