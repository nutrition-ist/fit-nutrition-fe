"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import placeholderimage from "../../../public/images/placeholder.jpg";
import InitialNavbar from "../../components/InitialNavbar";

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
  const [filteredDietitians, setFilteredDietitians] = useState<DietitianType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // Default page size;
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);

  // Fetch dietitians from the API
  const fetchDietitians = useCallback(
    async (url: string) => {
      try {
        setLoading(true);
        const response = await axios.get(url, {
          params: { page_size: pageSize },
        });

        if (response.data && Array.isArray(response.data.results)) {
          setDietitians(response.data.results);
          setFilteredDietitians(response.data.results);
          setNextPage(response.data.next);
          setPrevPage(response.data.previous);
        } else {
          throw new Error("Unexpected API response format.");
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching dietitians:", err.message);
          setError("Failed to fetch dietitians. Please try again later.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    },
    [pageSize] // Add pageSize as a dependency
  );

  // Fetch initial page on component mount
  useEffect(() => {
    fetchDietitians("https://hazalkaynak.pythonanywhere.com/dietician/");
  }, [fetchDietitians]);
  /**
   * Handles search input changes to filter the list of dietitians.
   * Updates the `filteredDietitians` state based on the query.
   *
   * - Converts the search input to lowercase for case-insensitive matching.
   * - Filters the list of dietitians based on whether their full name or qualifications match the query.
   * - Combines the first and last name of each dietitian for name matching.
   * - Joins all qualifications into a single string for qualification matching.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The search input change event.
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearch(query);

    const filtered = dietitians.filter((dietitian) => {
      const fullName =
        `${dietitian.first_name} ${dietitian.last_name}`.toLowerCase();
      const qualifications = dietitian.qualifications
        ?.join(" ") // Combine all qualifications into a single string
        .toLowerCase();

      return (
        fullName.includes(query) ||
        (qualifications && qualifications.includes(query))
      );
    });

    setFilteredDietitians(filtered);
  };

  // Handle pagination
  const handlePageChange = (url: string | null) => {
    if (url) {
      // Extract the page number from the URL
      const urlParams = new URL(url);
      const page = urlParams.searchParams.get("page");

      if (page) {
        setCurrentPage(Number(page));
      }

      fetchDietitians(url);
    }
  };
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };
  // Render loader
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error message
  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render no dietitians found message
  if (dietitians.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography>No dietitians found.</Typography>
      </Box>
    );
  }

  // Main component render
  return (
    <>
      <InitialNavbar />
      <Box sx={{ maxWidth: "1400px", mx: "auto", mt: 5, px: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          Dietitians List
        </Typography>

        {/* Search bar and pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mb: 4,
          }}
        >
          {/* Search Bar */}
          <TextField
            value={search}
            onChange={handleSearch}
            variant="outlined"
            placeholder="Search by name or qualifications"
            sx={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#4caf50",
                },
                "&:hover fieldset": {
                  borderColor: "#388e3c",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2e7d32",
                },
              },
            }}
          />

          {/* Page Size Selector */}
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            displayEmpty
            sx={{ mr: 2 }}
          >
            <MenuItem value={8}>8 per page</MenuItem>
            <MenuItem value={16}>16 per page</MenuItem>
            <MenuItem value={32}>32 per page</MenuItem>
            <MenuItem value={48}>48 per page</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}></Box>

        {/* Render Dietitian Cards */}
        <Grid container spacing={3} justifyContent="center">
          {filteredDietitians.map((dietitian) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dietitian.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1, // Makes cards dynamically expand
                  minWidth: "300px", // Ensures cards don't get too small
                  maxWidth: "100%", // Allows cards to use available space
                }}
              >
                <Image
                  src={
                    dietitian.profile_picture
                      ? `https://hazalkaynak.pythonanywhere.com/${dietitian.profile_picture}`
                      : placeholderimage
                  }
                  alt={`${dietitian.first_name} ${dietitian.last_name}`}
                  layout="responsive"
                  width={1}
                  height={1}
                  unoptimized
                  style={{
                    objectFit: "cover",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                  }}
                />
                <CardContent sx={{ padding: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {dietitian.first_name} {dietitian.last_name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Email:</strong> {dietitian.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Phone:</strong> {dietitian.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {dietitian.address}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>About Me:</strong>{" "}
                    {dietitian.about_me || "No information available."}
                  </Typography>

                  {dietitian.qualifications && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", mb: 2 }}
                    >
                      {dietitian.qualifications.map((qualification, index) => (
                        <Chip
                          key={index}
                          label={qualification}
                          color="primary"
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}

                  <Box>
                    {dietitian.facebook && (
                      <Button
                        variant="outlined"
                        href={dietitian.facebook}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        Facebook
                      </Button>
                    )}
                    {dietitian.instagram && (
                      <Button
                        variant="outlined"
                        href={dietitian.instagram}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        Instagram
                      </Button>
                    )}
                    {dietitian.x_twitter && (
                      <Button
                        variant="outlined"
                        href={dietitian.x_twitter}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        Twitter
                      </Button>
                    )}
                    {dietitian.youtube && (
                      <Button
                        variant="outlined"
                        href={dietitian.youtube}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        YouTube
                      </Button>
                    )}
                    {dietitian.whatsapp && (
                      <Button
                        variant="outlined"
                        href={dietitian.whatsapp}
                        target="_blank"
                        sx={{ mr: 1, mb: 1 }}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </Box>

                  <Link href={`/dietitian/${dietitian.username}`} passHref>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination Controls */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={!prevPage}
            onClick={() => handlePageChange(prevPage)}
          >
            Previous
          </Button>
          <Typography>Page {currentPage}</Typography>
          <Button
            disabled={!nextPage}
            onClick={() => handlePageChange(nextPage)}
          >
            Next
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Dietitians;
