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
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import BlogCard, { BlogPostSummary } from "@/components/BlogCard";

/* ---------- Static bloklar, dogru yazmazsan ismi kayar hayatın /public/blog ---------- */
type BlogIndexItem = {
  slug: string;
  file: string;
  fallbackTitle: string;
  cover?: string;
};

const BLOG_INDEX: BlogIndexItem[] = [
  {
    slug: "smarter-way-to-eat",
    file: "/blog/The Smarter Way to Eat Well and Stay on Track.md",
    fallbackTitle: "The Smarter Way to Eat Well and Stay on Track",
  },
  {
    slug: "future-of-nutrition-support",
    file: "/blog/Redefining the Future of Nutrition Support.md",
    fallbackTitle: "Redefining the Future of Nutrition Support",
  },
  {
    slug: "day-to-day-dietetics-easier",
    file: "/blog/Making the Day-to-Day of Dietetics Easier.md",
    fallbackTitle: "Making the Day-to-Day of Dietetics Easier",
  },
];

/* ---------- Types ---------- */
type Frontmatter = {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  cover?: string;
  tags?: string[];
  category?: string | string[];
  categories?: string[];
};

type LoadedMarkdown = {
  frontmatter: Frontmatter;
  html: string;
  plain: string;
};

type BlogPost = BlogPostSummary & {
  content_html?: string;
  content?: string;
};

/* ---------- Minimal frontmatter + markdown renderers ---------- */
function parseFrontmatter(md: string): { fm: Frontmatter; body: string } {
  const m = md.match(/^---\s*([\s\S]*?)\s*---\s*/);
  if (!m) return { fm: {}, body: md };
  const raw = m[1];
  const body = md.slice(m[0].length);

  const fm: Frontmatter = {};
  raw.split(/\r?\n/).forEach((line) => {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) return;
    const key = kv[1].trim();
    const val = kv[2]
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");

    const toArray = (v: string) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    switch (key) {
      case "title":
        fm.title = val;
        break;
      case "description":
        fm.description = val;
        break;
      case "author":
        fm.author = val;
        break;
      case "date":
        fm.date = val;
        break;
      case "cover":
        fm.cover = val;
        break;
      case "tags":
        fm.tags = toArray(val);
        break;
      case "category":
        fm.category = toArray(val);
        break;
      case "categories":
        fm.categories = toArray(val);
        break;
      default:
        break;
    }
  });

  return { fm, body };
}

function mdToHtml(src: string): string {
  let s = src;

  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  s = s.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  s = s.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`
  );

  s = s.replace(/^(?:-|\*) (.*(?:\r?\n(?:-|\*) .*)*)/gm, (block) => {
    const items = block
      .split(/\r?\n/)
      .map((line) => line.replace(/^(?:-|\*) /, "").trim())
      .map((li) => `<li>${li}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  s = s
    .split(/\n{2,}/)
    .map((para) =>
      para.match(/^<h\d|^<ul|^<p|^<blockquote|^<img|^<pre|^<code/)
        ? para
        : `<p>${para.replace(/\n/g, "<br/>")}</p>`
    )
    .join("\n");

  return s;
}

function renderMarkdown(md: string): LoadedMarkdown {
  const { fm, body } = parseFrontmatter(md);
  const html = mdToHtml(body);
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[>#_*~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { frontmatter: fm, html, plain };
}

/* ---------- Helpers ---------- */
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const readingTime = (text: string): number =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

function normalizeTags(fm: Frontmatter): string[] {
  const set = new Set<string>();
  (fm.tags ?? []).forEach((t) => set.add(t));
  const cat = fm.category;
  if (typeof cat === "string") set.add(cat);
  else if (Array.isArray(cat)) cat.forEach((c) => set.add(c));
  (fm.categories ?? []).forEach((c) => set.add(c));
  return [...set];
}

/* ---------- Page ---------- */
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
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const loaded = await Promise.all(
          BLOG_INDEX.map(async (item): Promise<BlogPost> => {
            const res = await fetch(item.file, { cache: "force-cache" });
            if (!res.ok) throw new Error(`Failed to fetch ${item.file}`);
            const text = await res.text();
            const { frontmatter, html, plain } = renderMarkdown(text);

            const title = frontmatter.title || item.fallbackTitle;
            const created = frontmatter.date || new Date().toISOString();
            const tags = normalizeTags(frontmatter);

            const summary =
              frontmatter.description ||
              (plain.length > 160 ? `${plain.slice(0, 160)}…` : plain);

            const post: BlogPost = {
              id: item.slug,
              slug: item.slug,
              title,
              summary,
              tags,
              created_at: created,
              read_minutes: readingTime(plain),
              cover_image: frontmatter.cover ?? item.cover ?? undefined,
              content_html: html,
              content: plain,
              author: frontmatter.author, 
            };
            return post;
          })
        );

        loaded.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (mounted) setPosts(loaded);
      } catch {
        if (mounted) setErr("Failed to load posts.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
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
            {fmtDate(selected.created_at)} · {selected.read_minutes ?? 1} min
            read
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
              <Image
                src={selected.cover_image}
                alt={selected.title}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                style={{ objectFit: "cover" }}
                priority
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
                  "& a": { color: "primary.main", textDecoration: "underline" },
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
