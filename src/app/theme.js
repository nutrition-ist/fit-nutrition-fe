import { createTheme } from "@mui/material/styles";

// Define a custom theme with green as the primary color
const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50", // Green for primary buttons and accents
      contrastText: "#ffffff", // White text for buttons
    },
    secondary: {
      main: "#388e3c", // Darker green for secondary actions
    },
    success: {
      main: "#81c784", // Light green for success indicators
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
          backgroundColor: "#4caf50", // Green button
          "&:hover": {
            backgroundColor: "#388e3c", // Darker green on hover
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8f5e9", // Light green for chips
          color: "#1b5e20", // Dark green text
        },
      },
    },
  },
});

export default theme;