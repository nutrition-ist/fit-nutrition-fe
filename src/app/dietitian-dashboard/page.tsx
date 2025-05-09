"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import RegisterPatient from "@/components/RegisterPatient";
import SocialLinks from "@/components/SocialLinks";
import placeholderimage from "../../../public/images/placeholder.jpg";
import AppointmentsCalendar from "@/components/AppointmentsCalendar";

interface DietitianDashboardData {
  dietitian: {
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
  };
  patients_list: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    dietician: number;
    profile_picture: string | null;
  }[];
  appointment_list: {
    id: number;
    patient: number;
    dietician: number;
    date_time: string;
    is_active: boolean;
  }[];
}

const DietitianDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [profile, setProfile] = useState<DietitianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // Redirect to login with a return URL
      window.location.href = `/login?redirect=dietitian-dashboard`;
      return;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://hazalkaynak.pythonanywhere.com/";

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${apiUrl}dietitian/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response);
        setProfile({
          dietitian: response.data.dietician,
          patients_list: response.data.patients_list,
          appointment_list: [],
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = `/login?redirect=dietitian-dashboard`;
          } else {
            setError("Failed to fetch profile. Please try again later.");
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePatientRegistered = (newPatient: any) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        patients_list: [...prevProfile.patients_list, newPatient],
      };
    });
  };
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

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

  if (!profile) {
    return null;
  }

  return (
    <Grid container sx={{ height: "100vh" }}>
      {/* Left Sidebar: Profile Section */}
      <Grid
        item
        xs={12}
        md={2}
        lg={2}
        sx={{ backgroundColor: "#f4f4f4", padding: 2 }}
      >
        <Card sx={{ padding: 3, textAlign: "center" }}>
          <Image
            src={
              profile.dietitian.profile_picture
                ? `https://hazalkaynak.pythonanywhere.com/${profile.dietitian.profile_picture}`
                : placeholderimage
            }
            alt="Dietitian Picture"
            width={100}
            height={100}
            unoptimized
            style={{
              borderRadius: "50%",
              marginBottom: "16px",
            }}
          />
          <Typography variant="h6">
            {profile.dietitian.first_name} {profile.dietitian.last_name}
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            {profile.dietitian.about_me}
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            {profile.dietitian.qualifications?.length
              ? profile.dietitian.qualifications.join(", ")
              : "No qualifications available."}
          </Typography>
        </Card>
      </Grid>

      {/* Main Content: Tabs Section */}
      <Grid item xs={12} md={10} lg={10} sx={{ padding: 3 }}>
        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Patients" />
          <Tab label="Appointments" />
          <Tab label="Contact & Socials" />
        </Tabs>

        {/* Tabs Content */}
        <Box sx={{ marginTop: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Patients</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenDialog}
                >
                  Register Patient
                </Button>
              </Stack>

              <List>
                {profile.patients_list.map((patient) => (
                  <ListItem key={patient.id}>
                    <ListItemText
                      primary={`${patient.first_name} ${patient.last_name}`}
                      secondary={patient.email}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Register Patient Dialog */}
              <RegisterPatient
                open={openDialog}
                onClose={handleCloseDialog}
                onPatientRegistered={handlePatientRegistered}
              />
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Appointments
              </Typography>
              <AppointmentsCalendar
                appointments={profile.appointment_list}
                workingHours={{ startHour: 9, endHour: 17 }}
              />
            </Box>
          )}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contact & Socials
              </Typography>
              <Typography variant="body1" gutterBottom>
                Phone: {profile.dietitian.phone}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Address: {profile.dietitian.address}
              </Typography>
              <SocialLinks dietitian={profile.dietitian} />
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default DietitianDashboard;
