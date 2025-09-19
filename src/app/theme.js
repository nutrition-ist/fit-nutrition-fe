import { createTheme } from "@mui/material/styles";

// Define a custom theme with green as the primary color
const theme = createTheme({
  palette: {
    primary: {
      main: "#006B5E", // Green for primary buttons and accents
      contrastText: "#ffffff", // White text for buttons
    },
    secondary: {
      main: "#388e3c", // Darker green for secondary actions
    },
    success: {
      main: "#e8f5e9", // Light green for success indicators
    },
    background: {
      default: "#ffffff", // White background
      paper: "#ffffff", // White background for cards
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded buttons
        },
        containedPrimary: {
          backgroundColor: "#006B5E", // Green button
          "&:hover": {
            backgroundColor: "#00614e", // Darker green on hover
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8f5e9", // Light green for chips
          color: "#006B5E", // Dark green text
        },
      },
    },
  },
});

export default theme;