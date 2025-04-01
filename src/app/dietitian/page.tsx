"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import axios from "axios";

import InitialNavbar from "../../components/InitialNavbar";
import DietitianCard from "@/components/DietitianCard";

interface DietitianType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  about_me?: string;
  qualifications: string[];
  phone: string;
  address: string;
  profile_picture: string | null;
  facebook: string | null;
  instagram: string | null;
  x_twitter: string | null;
  youtube: string | null;
  whatsapp: string | null;
}

const Dietitians: React.FC = () => {
  const [dietitians, setDietitians] = useState<DietitianType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1); //
  const [hasMore, setHasMore] = useState(true);
  const [hasPrev, setHasPrev] = useState(false); // Initially, there's no previous data thereforee false.

  const bottomLoaderRef = useRef<HTMLDivElement | null>(null);
  const topLoaderRef = useRef<HTMLDivElement | null>(null);

  const MAX_ITEMS = 16;
  const fetchDietitians = async (pageNumber: number) => {
    if (loading) return;

    try {
      setLoading(true);
      pageRef.current = pageNumber;
      const response = await axios.get(
        `https://hazalkaynak.pythonanywhere.com/dietitian/?page=${pageNumber}&page_size=8`
      );

      if (response.data && Array.isArray(response.data.results)) {
        setDietitians((prev) => {
          const newData = response.data.results.filter(
            (newItem: DietitianType) =>
              !prev.some((existing) => existing.id === newItem.id)
          );

          let updatedList;
          console.log("Page number:", pageNumber, pageRef.current);

          if (pageNumber > pageRef.current - 1) {
            // Scrolling Down
            updatedList = [...prev, ...newData].slice(-MAX_ITEMS);
            console.log("bana giren var");

            // setTimeout(()=>{
            //   window.scrollTo({
            //     top: window.innerHeight /4,
            //     behavior: "smooth",
            //   });
            // }, 10)
          } else {
            //  Scrolling Up
            updatedList = [...newData, ...prev].slice(0, MAX_ITEMS);
          }
          console.log("max items:", MAX_ITEMS);

          return updatedList;
        });

        setHasMore(!!response.data.next);
        setHasPrev(!!response.data.previous);
      } else {
        setHasMore(false);
        setHasPrev(false);
      }
    } catch (err) {
      console.error("Error fetching dietitians:", err);
      setError("Failed to fetch dietitians. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const savedDietitians = sessionStorage.getItem("dietitiansData");
    const savedPage = sessionStorage.getItem("currentPage");
    const savedPosition = sessionStorage.getItem("scrollPosition");

    if (savedDietitians && savedPage) {
      setDietitians(JSON.parse(savedDietitians)); // Restore dietitians list
      setPage(parseInt(savedPage, 10)); // Restore page number
    } else {
      fetchDietitians(page); // Fetch fresh data if no memory is found
    }

    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition, 10),
          behavior: "instant",
        });
      }, 600); // Small delay ensures content loads before scrolling
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // eslint want's me to add fetchDietitians here but doing so will cause infinte loops.

  // Clear pos

  // Load next page when reaching bottom
  useEffect(() => {
    if (!bottomLoaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
          pageRef.current += 1;
          fetchDietitians(pageRef.current);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(bottomLoaderRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, dietitians.length]); //again will cause infinite loop

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("dietitiansData");
      sessionStorage.removeItem("currentPage");
      sessionStorage.removeItem("scrollPosition");
    };
  }, []);

  //  Load previous pages when scrolling up
  useEffect(() => {
    if (!topLoaderRef.current) return;

    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasPrev) {
          if (timeoutId) return; // Prevents multiple rapid calls

          timeoutId = setTimeout(() => {
            setPage((prev) => Math.max(1, prev - 1));
            pageRef.current = Math.max(1, pageRef.current - 1);
            fetchDietitians(pageRef.current);
          }, 1000); //oyna
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(topLoaderRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId); // Clear timeout when unmounting
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrev, loading, dietitians.length]); //again will cause infinite loop

  // Render error message
  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <InitialNavbar />
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          mt: 5,
          px: 3,
          minHeight: "100vh",
          overflow: "hidden", // Scrollbar fix
        }}
      >
        <Box ref={topLoaderRef} sx={{ height: 10 }} />

        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          Dietitians List
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {dietitians.map((dietitian) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dietitian.id}>
              <DietitianCard dietitian={dietitian} />
            </Grid>
          ))}
        </Grid>

        <Box
          ref={bottomLoaderRef}
          sx={{ display: "flex", justifyContent: "center", mt: 4, height: 10 }}
        >
          {loading && <CircularProgress />}
        </Box>
      </Box>
    </>
  );
};

export default Dietitians;
