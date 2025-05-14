import React from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
interface DietitianProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  about_me: string;
  profile_picture?: string;
}
const fetchAllDietitians = async (): Promise<{ username: string }[]> => {
  const all: { username: string }[] = [];
  let url = "https://hazalkaynak.pythonanywhere.com/dietitian/?page_size=100"; // large page_size keeps requests low

  try {
    while (url) {
      const { data } = await axios.get(url);

      if (Array.isArray(data.results)) {
        all.push(
          ...data.results.map((d: { username: string }) => ({
            username: d.username,
          }))
        );
      }

      url = data.next; // DRF gives the next page URL; loop until it’s null
    }
  } catch (err) {
    console.error("Error fetching dietitian list:", err);
  }

  return all;
};

const fetchDietitianProfile = async (
  username: string
): Promise<DietitianProfile | null> => {
  try {
    const { data } = await axios.get(
      `https://hazalkaynak.pythonanywhere.com/dietitian/${username}`
    );
    return data?.dietician ?? null;
  } catch (err) {
    console.error("Error fetching profile:", err);
    return null;
  }
};

export async function generateStaticParams() {
  const dietitians = await fetchAllDietitians();
  return dietitians.map(({ username }) => ({ username }));
}

// Main Profile Page Component
export default async function DietitianProfilePage({
  params: paramsPromise,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await paramsPromise;

  const profile = await fetchDietitianProfile(username);
  if (!profile) return notFound();

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
