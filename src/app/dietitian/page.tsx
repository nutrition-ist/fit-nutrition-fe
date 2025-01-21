"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import placeholderimage from "../../../public/images/placeholder.jpg";
import InitialNavbar from "@/components/InitialNavbar";

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

  // Fetch dietitians from the API
  useEffect(() => {
    const fetchDietitians = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://hazalkaynak.pythonanywhere.com/dietitian/"
        );

        if (response.data && Array.isArray(response.data.dietician_list)) {
          setDietitians(response.data.dietician_list); // Store all dietitians
          setFilteredDietitians(response.data.dietician_list); // Initially show all dietitians
        } else {
          throw new Error("Unexpected API response format.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Error fetching dietitians:", err.message);
          setError("Failed to fetch dietitians. Please try again later.");
        } else {
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDietitians();
  }, []);

  /**
   * Handles search input changes to filter the list of dietitians.
   * Updates the filteredDietitians state based on the query.

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

  /**
   * Render a message if no dietitians are found.
   */
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

  // Render an error message if API call fails
  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render a message if no dietitians are found
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
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 3 }}>
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          Dietitians List
        </Typography>

        {/* Search Bar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
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
        </Box>

        {/* Render Dietitian Cards */}
        <Grid container spacing={4}>
          {filteredDietitians.map((dietitian) => (
            <Grid item xs={12} sm={6} lg={4} key={dietitian.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Profile Picture */}
                <Image
                  src={dietitian.profile_picture || placeholderimage}
                  alt={`${dietitian.first_name} ${dietitian.last_name}`}
                  width={400}
                  height={250}
                  style={{
                    objectFit: "cover",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                  }}
                />
                <CardContent>
                  {/* Name */}
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    {dietitian.first_name} {dietitian.last_name}
                  </Typography>

                  {/* Email */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Email:</strong> {dietitian.email}
                  </Typography>

                  {/* Phone */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Phone:</strong> {dietitian.phone}
                  </Typography>

                  {/* Address */}
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Address:</strong> {dietitian.address}
                  </Typography>

                  {/* About Me */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>About Me:</strong>{" "}
                    {dietitian.about_me || "No information available."}
                  </Typography>

                  {/* Qualifications */}
                  {dietitian.qualifications && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", mb: 2 }}
                    >
                      {dietitian.qualifications.map(
                        (qualification, index) => (
                          <Chip
                            key={index}
                            label={qualification}
                            color="primary"
                            size="small"
                          />
                        )
                      )}
                    </Stack>
                  )}

                  {/* Social Media Links */}
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

                  {/* View Profile Button */}
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
      </Box>
    </>
  );
};

export default Dietitians;
