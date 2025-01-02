"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

import HeroImage from "../../public/images/cook.png";
import TestimonialImage from "../../public/images/nitfut.jpg";

const LandingPage: React.FC = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Fit Nutrition
        </Typography>
        <Box>
          <Link href="/" passHref>
            <Button variant="text" sx={{ mx: 1 }}>
              Home
            </Button>
          </Link>
          <Link href="/wip" passHref>
            <Button variant="text" sx={{ mx: 1 }}>
              Dietitians
            </Button>
          </Link>
          <Link href="/wip" passHref>
            <Button variant="text" sx={{ mx: 1 }}>
              Blog
            </Button>
          </Link>
          <Link href="/wip" passHref>
            <Button variant="text" sx={{ mx: 1 }}>
              Dietitian Panel
            </Button>
          </Link>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 5,
          py: 5,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            Find Your Perfect Dietitian
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4 }}>
            Connect with expert dietitians and start your journey to a healthier
            you.
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search for a dietitian"
            sx={{ width: "300px", mr: 2 }}
          />
          <Button variant="contained" color="primary">
            Search
          </Button>
        </Box>
        <Box sx={{ maxWidth: "40%" }}>
          <Image
            src={HeroImage}
            alt="Healthy lifestyle"
            width={400}
            height={500}
            style={{ borderRadius: "10px" }}
          />
        </Box>
      </Box>
      <Box sx={{ px: 5, py: 5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: "Search Dietitians",
              description:
                "Explore our list of qualified dietitians tailored to your preferences.",
              buttonText: "Get Started",
            },
            {
              title: "Book a Consultation",
              description:
                "Schedule a session with your selected dietitian at your convenience.",
              buttonText: "Book Now",
            },
            {
              title: "Achieve Your Goals",
              description:
                "Follow personalized diet plans and track your progress.",
              buttonText: "Learn More",
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card sx={{ textAlign: "center", p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  {item.title}
                </Typography>
                <Typography>{item.description}</Typography>
                <Link href="/wip" passHref>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    {item.buttonText}
                  </Button>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          py: 5,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Success Stories
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Card role="article">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  John Doe
                </Typography>
                <Typography sx={{ mb: 2 }}>I like this site 5/5</Typography>
                <Image
                  src={TestimonialImage}
                  alt="John Doe"
                  width={200}
                  height={200}
                  style={{
                    borderRadius: "10px",
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          backgroundColor: "#3f51b5",
          color: "#ffffff",
          py: 3,
          px: 5,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          &copy; 2024 Fit Nutrition. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
