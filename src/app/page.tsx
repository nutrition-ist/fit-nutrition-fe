"use client";
import React from "react";
import Image from "next/image";
import { Box } from "@mui/material";
import FeatureSection from "@/components/FeatureSection";
import ServicesSection from "@/components/ServicesSection";
import HeroSection from "@/components/HeroSection";
import MetricsBanner from "@/components/MetricsBanner";
import Carousel from "@/components/Carousel";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const SERVICE_ITEMS = [
  {
    title: "Personalized Nutrition Counseling",
    img: "/images/PersonalizedNut.png",
  },
  { title: "Meal Planning with AI", img: "/images/MealPlanningAi.png" },
  { title: "Customizable Recipes", img: "/images/CustomizableRecipes.png" },
  { title: "AI Recipe Generator", img: "/images/AIRecipeGen.png" },
];

const METRICS = [
  {
    value: "8,500+",
    label: "Recipes",
    caption: "From gluten‑free to high‑protein",
    icon: (
      <Image
        src="/images/recipesIcon.jpg"
        alt=""
        width={90}
        height={70}
        style={{ objectFit: "contain" }}
      />
    ),
  },
  {
    value: "2,500+",
    label: "Registered Dietitians",
    caption: "Helping clients eat better, live better",
    icon: (
      <Image
        src="/images/registeredIcon.jpg"
        alt=""
        width={90}
        height={70}
        style={{ objectFit: "contain" }}
      />
    ),
  },
  {
    value: "150,000+",
    label: "Hours Saved on Meal Planning",
    caption: "Thanks to automated suggestions",
    icon: (
      <Image
        src="/images/hoursIcon.jpg"
        alt=""
        width={90}
        height={70}
        style={{ objectFit: "contain" }}
      />
    ),
  },
];

const TESTIMONIALS = [
  {
    img: "/images/avatars/sofia.jpg",
    name: "Dr. Sofia Mendes, Clinical Dietitian",
    quote:
      "The built‑in meal planning tools cut my session prep time in half. My clients love the personalized recipe library!",
  },
  {
    img: "/images/avatars/mark.jpg",
    name: "Mark Duval, Sports Nutritionist",
    quote:
      "Booking consultations is now seamless. No more back‑and‑forth emails.",
  },
  {
    img: "/images/avatars/ayse.jpg",
    name: "Ayşe Karaca, Registered Dietitian",
    quote:
      "It’s like having an assistant that knows my workflow. From recipe macros to reminders, this app just gets dietitians.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <Box>
      <Navbar />
      <HeroSection
        title="Find Your Perfect Dietitian"
        subtitle="Connect with expert dietitians and start your journey to a healthier you."
        bgImage="/images/slider.png"
        searchBarProps={{
          placeholder: "Search for dietitians",
          onSearch: (q) => console.log("search:", q),
        }}
        primaryCta={{ label: "Book an Appointment", href: "/booking" }}
      />
      <ServicesSection items={SERVICE_ITEMS} />

      <FeatureSection />
      <MetricsBanner items={METRICS} />
      <Carousel items={TESTIMONIALS} />
      <CtaSection
        title="For Nutrition Pros Only"
        paragraphs={[
          `You’re the expert — we just give you the tools to shine! Get started with a <strong>14‑day free trial</strong> made just for dietitians, nutritionists, and wellness teams.`,
          "Your clients? They get access for free. Always.",
          "Try it out — no credit card needed.",
        ]}
        primary={{
          label: "Start Free Trial",
          href: "/register",
          // variant defaults to "contained"
        }}
        secondary={{
          label: "See Pricing Plans",
          href: "/pricing",
          variant: "outlined",
        }}
      />
      <Footer />
    </Box>
  );
};
export default LandingPage;
