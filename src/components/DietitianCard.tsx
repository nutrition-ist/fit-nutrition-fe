import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import Image from "next/image";
import placeholderimage from "../../public/images/placeholder.jpg";
import SocialLinks from "./SocialLinks";

interface DietitianProps {
  dietitian: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    about_me?: string;
    qualifications: string[];
    profile_picture: string | null;
    facebook: string | null;
    instagram: string | null;
    x_twitter: string | null;
    youtube: string | null;
    whatsapp: string | null;
    username: string;
  };
}

const DietitianCard: React.FC<DietitianProps> = ({ dietitian }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minHeight: 400,
      }}
    >
      <Image
        src={
          dietitian.profile_picture
            ? `https://hazalkaynak.pythonanywhere.com/${dietitian.profile_picture}`
            : placeholderimage
        }
        alt={`${dietitian.first_name} ${dietitian.last_name}`}
        layout="responsive"
        width={1}
        height={1}
        unoptimized
        style={{
          objectFit: "cover",
          borderTopLeftRadius: "4px",
          borderTopRightRadius: "4px",
        }}
      />
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {dietitian.first_name} {dietitian.last_name}
        </Typography>
        <Typography variant="body2">
          <strong>Email:</strong> {dietitian.email}
        </Typography>
        <Typography variant="body2">
          <strong>Phone:</strong> {dietitian.phone}
        </Typography>
        <Typography variant="body2">
          <strong>Address:</strong> {dietitian.address}
        </Typography>
        <Typography variant="body2">
          <strong>About Me:</strong>{" "}
          {dietitian.about_me || "No information available."}
        </Typography>

        {/* Qualifications */}
        {dietitian.qualifications.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", my: 2 }}>
            {dietitian.qualifications.map((qualification, index) => (
              <Chip
                key={index}
                label={qualification}
                color="primary"
                size="small"
              />
            ))}
          </Stack>
        )}

        {/* Social Media Links */}
        <SocialLinks dietitian={dietitian} />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          href={`/dietitian/${dietitian.username}`}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default DietitianCard;
