"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import axios from "axios";
import DietitianCard from "@/components/DietitianCard";
import FilterBar from "@/components/FilterBar";
import { ConsultType } from "@/components/ConsultTypeToggle";

/* ---------- helpers ---------- */
const isBrowser = typeof window !== "undefined";

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

const DietitiansPage: React.FC = () => {
  /* 1️⃣  default (empty) state */
  const [categories, setCategories] = useState<string[]>([]);
  const [consultType, setConsultType] = useState<ConsultType>("all");
  const [showUnavailable, setShowUnavailable] = useState(false);

  /* 2️⃣  after hydration, load saved filters */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("diet_filters_categories");
      if (raw) setCategories(JSON.parse(raw));

      const type = sessionStorage.getItem("diet_filters_consultType");
      if (type) setConsultType(type as ConsultType);

      setShowUnavailable(
        sessionStorage.getItem("diet_filters_showUnavailable") === "1"
      );
    } catch {
      /* ignore parse errors */
    }
  }, []);

  /* 3️⃣  persist whenever they change */
  useEffect(() => {
    sessionStorage.setItem(
      "diet_filters_categories",
      JSON.stringify(categories)
    );
  }, [categories]);

  useEffect(() => {
    sessionStorage.setItem("diet_filters_consultType", consultType);
  }, [consultType]);

  useEffect(() => {
    sessionStorage.setItem(
      "diet_filters_showUnavailable",
      showUnavailable ? "1" : "0"
    );
  }, [showUnavailable]);
  /* ---------- pagination ---------- */
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = async (p: number) => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `https://hazalkaynak.pythonanywhere.com/dietitian/?page=${p}&page_size=12`
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

  /* ---------- persist filters ---------- */
  useEffect(() => {
    if (isBrowser)
      sessionStorage.setItem(
        "diet_filters_categories",
        JSON.stringify(categories)
      );
  }, [categories]);

  useEffect(() => {
    if (isBrowser)
      sessionStorage.setItem("diet_filters_consultType", consultType);
  }, [consultType]);

  useEffect(() => {
    if (isBrowser)
      sessionStorage.setItem(
        "diet_filters_showUnavailable",
        showUnavailable ? "1" : "0"
      );
  }, [showUnavailable]);

  /* ---------- visible list ---------- */
  const visibleDietitians = useMemo(() => {
    return dietitians.filter((d) => {
      if (!showUnavailable && d.available === false) return false;
      if (
        categories.length &&
        !categories.every((c) => d.qualifications.includes(c))
      )
        return false;
      if (consultType === "online" && d.online_booking === false) return false;
      return true;
    });
  }, [dietitians, categories, consultType, showUnavailable]);

  /* ---------- restore scroll ---------- */
  useEffect(() => {
    if (!isBrowser) return;
    const saved = sessionStorage.getItem("diet_scroll_pos");
    if (saved) {
      window.scrollTo({ top: Number(saved), behavior: "instant" });
      sessionStorage.removeItem("diet_scroll_pos");
    }
  }, [visibleDietitians.length]);

  /* ---------- infinite scroll ---------- */
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

  /* ---------- reset ---------- */
  const resetFilters = () => {
    setCategories([]);
    setConsultType("all");
    setShowUnavailable(false);
    if (isBrowser) {
      sessionStorage.removeItem("diet_filters_categories");
      sessionStorage.removeItem("diet_filters_consultType");
      sessionStorage.removeItem("diet_filters_showUnavailable");
    }
  };

  /* ---------- render ---------- */
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

      <Box
        sx={{
          pb: 10,
          bgcolor: "#fafafa",
          minHeight: "100vh",
          px: { xs: 2, md: 4 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          columns={{ xs: 12, sm: 12, md: 12, lg: 15, xl: 18 }}
        >
          {visibleDietitians.map((d) => (
            <Grid
              key={d.id}
              item
              xs={12}
              sm={6}
              md={4} 
              lg={3} 
              xl={3}
            >
              <DietitianCard
                dietitian={d}
                onCardClick={() => {
                  if (isBrowser)
                    sessionStorage.setItem(
                      "diet_scroll_pos",
                      String(window.scrollY)
                    );
                  window.location.assign(`/dietitian/${d.username}`);
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Box ref={loaderRef} sx={{ height: 1 }} />
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </>
  );
};

export default DietitiansPage;
