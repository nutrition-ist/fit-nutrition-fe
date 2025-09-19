import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import Typography from "@mui/material/Typography";

const InitialNavbar: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 3,
        py: 2,
        backgroundColor: "primary.main",
        color: "white",
        borderBottom: "3px solid #388e3c",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: "white",
        }}
      >
        Fit Nutrition
      </Typography>
      <Box>
        <Link href="/" passHref>
          <Button
            variant="text"
            sx={{
              mx: 1,
              color: "white", 
              "&:hover": {
                color: "#e8f5e9", 
              },
            }}
          >
            Home
          </Button>
        </Link>
        <Link href="/dietitian" passHref>
          <Button
            variant="text"
            sx={{
              mx: 1,
              color: "white",
              "&:hover": {
                color: "#e8f5e9",
              },
            }}
          >
            Dietitians
          </Button>
        </Link>
        <Link href="/wip" passHref>
          <Button
            variant="text"
            sx={{
              mx: 1,
              color: "white",
              "&:hover": {
                color: "#e8f5e9",
              },
            }}
          >
            Blog
          </Button>
        </Link>
        <Link href="/dietitian-dashboard" passHref>
          <Button
            variant="text"
            sx={{
              mx: 1,
              color: "white",
              "&:hover": {
                color: "#e8f5e9",
              },
            }}
          >
            Dietitian Panel
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default InitialNavbar;