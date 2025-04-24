"use client"; 

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Box } from "@mui/material";
import theme from "./theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppRouterCacheProvider>
        <Box
          sx={{
            minHeight: "100vh", // fill viewport height
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Navbar />

          <Box component="main" sx={{ flexGrow: 1 }}>
            {children}
          </Box>

          <Footer />
        </Box>
      </AppRouterCacheProvider>
    </ThemeProvider>
  );
}