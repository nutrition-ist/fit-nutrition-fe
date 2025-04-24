import React from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  about_me: string;
  profile_picture?: string;
}
//Fetch all the Dietians then get their usernames for generating static path for the generateStaticParams function.
const fetchAllDietitians = async (): Promise<{ username: string }[]> => {
  try {
    const response = await axios.get(
      "https://hazalkaynak.pythonanywhere.com/dietitian/"
    );

    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results.map((dietitian: { username: string }) => ({
        username: dietitian.username,
      }));
    } else {
      console.error("Unexpected API response format.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching dietitian list:", error);
    return [];
  }
};

const fetchDietitianProfile = async (
  username: string
): Promise<Profile | null> => {
  try {
    const response = await axios.get(
      `https://hazalkaynak.pythonanywhere.com/dietitian/${username}`
    );

    if (response.data && response.data.dietician) {
      return response.data.dietician;
    } else {
      console.error("Unexpected API response format.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Generate Static Params for Dynamic Route
export async function generateStaticParams() {
  const dietitians = await fetchAllDietitians();
  return dietitians.map((dietitian) => ({
    username: dietitian.username,
  }));
}

// Main Profile Page Component
export default async function DietitianProfilePage({
  params: paramsPromise,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await paramsPromise; // Await here fixes my hopes
  const profile = await fetchDietitianProfile(username);

  // Redirect to 404 if profile is not found
  if (!profile) {
    return notFound();
  }
  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 5, px: 3 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
      >
        {profile.first_name} {profile.last_name}&apos;s Profile
      </Typography>

      <Profile profile={profile} />
    </Box>
  );
}
