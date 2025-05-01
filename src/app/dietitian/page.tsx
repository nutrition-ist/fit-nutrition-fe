"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Container, Grid, CircularProgress } from "@mui/material";
import axios from "axios";

import DietitianCard from "@/components/DietitianCard";
import FilterBar from "@/components/FilterBar";
import { ConsultType } from "@/components/ConsultTypeToggle";

/* ---------- data types ---------- */
interface Dietitian {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  about_me?: string;
  qualifications: string[];
  profile_picture: string | null;
  available?: boolean;
  next_available_date?: string;
  online_booking?: boolean;
}

/* ---------- constants ---------- */
const CATEGORY_LIST = [
  "Holistic Nutrition",
  "Functional Medicine Nutrition",
  "Weight Loss Coaching",
  "Environmental Nutrition",
  "Pediatric Obesity Management",
  "Public Health Nutrition",
  "Nutrition for Mental Health",
  "Anti-Inflammatory Diets",
  "Mindful Eating",
  "IBS Diets",
  "Sustainable Nutrition",
  "Sports Supplementation",
  "Corporate Wellness Programs",
];

/* ---------- component ---------- */
const DietitiansPage: React.FC = () => {
  /* pagination */
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* filters */
  const [categories, setCategories] = useState<string[]>([]);
  const [consultType, setConsultType] = useState<ConsultType>("all");
  const [showUnavailable, setShowUnavailable] = useState(false);

  /* -------- fetch */
  const fetchPage = async (p: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://hazalkaynak.pythonanywhere.com/dietitian/?page=${p}&page_size=8`
      );

      const newItems: Dietitian[] = res.data.results;
      setDietitians((prev) => {
        const ids = new Set(prev.map((d) => d.id));
        return [...prev, ...newItems.filter((d) => !ids.has(d.id))];
      });

      setHasMore(Boolean(res.data.next));
      setPage(p);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchPage(page + 1);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(loaderRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderRef, loading, hasMore, page]);

  /* -------- derived list ---------- */
  const visibleDietitians = useMemo(() => {
    return dietitians.filter((d) => {
      if (!showUnavailable && d.available === false) return false;

      if (
        categories.length &&
        !categories.every((c) => d.qualifications.includes(c))
      ) {
        return false;
      }

      if (consultType === "online" && d.online_booking === false) return false;
      // (in-person flag not yet implemented)

      return true;
    });
  }, [dietitians, categories, consultType, showUnavailable]);

  /* -------- reset everything ---------- */
  const resetFilters = () => {
    setCategories([]);
    setConsultType("all");
    setShowUnavailable(false);
  };

  /* -------- render ---------- */
  return (
    <>
      <FilterBar
        categories={CATEGORY_LIST}
        selectedCategories={categories}
        onSelectCategories={setCategories}
        consultType={consultType}
        onConsultTypeChange={setConsultType}
        showUnavailable={showUnavailable}
        onToggleUnavailable={() => setShowUnavailable((p) => !p)}
        onReset={resetFilters}
      />

      <Box sx={{ pb: 10, bgcolor: "#fafafa", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {visibleDietitians.map((d) => (
              <Grid key={d.id} item xs={12} sm={6} md={4} lg={3}>
                <DietitianCard dietitian={d} />
              </Grid>
            ))}
          </Grid>

          <Box ref={loaderRef} sx={{ height: 1 }} />
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};
export default DietitiansPage;
