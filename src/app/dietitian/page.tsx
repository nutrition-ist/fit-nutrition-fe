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
} from "@mui/material";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import placeholderimage from "../../../public/images/placeholder.jpg";

interface DietitianType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  about_me?: string;
  qualifications?: string[];
  phone: string;
  address: string;
  profile_picture: string | null;
  facebook: string[] | null;
  instagram: string[] | null;
  x_twitter: string[] | null;
  youtube: string[] | null;
  whatsapp: string[] | null;
}

const Dietitians: React.FC = () => {
  const [dietitians, setDietitians] = useState<DietitianType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietitians = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://hazalkaynak.pythonanywhere.com/dietitian/"
        );

        if (response.data && Array.isArray(response.data.dietician_list)) {
          setDietitians(response.data.dietician_list);
        } else {
          throw new Error("Unexpected API response format.");
        }
      } catch (err: any) {
        console.error("Error fetching dietitians:", err.message || err);
        setError("Failed to fetch dietitians. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietitians();
  }, []);

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

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (dietitians.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography>No dietitians found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 5, px: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
      >
        Dietitians List
      </Typography>

      <Grid container spacing={4}>
        {dietitians.map((dietitian) => (
          <Grid item xs={12} sm={6} key={dietitian.id}>
            <Card
              sx={{ height: "100%", display: "flex", alignItems: "center" }}
            >
              <Image
                src={dietitian.profile_picture || placeholderimage}
                alt={`${dietitian.first_name} ${dietitian.last_name}`}
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  marginLeft: "16px",
                  objectFit: "cover",
                }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {dietitian.first_name} {dietitian.last_name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Email:</strong> {dietitian.email}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  <strong>Phone:</strong> {dietitian.phone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>About Me:</strong>{" "}
                  {dietitian.about_me || "No information available."}
                </Typography>
                <Link href={`/dietitian/${dietitian.username}`} passHref>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dietitians;
