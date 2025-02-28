import React from "react";
import { Stack, Button } from "@mui/material";

interface SocialLinksProps {
  dietitian: {
    facebook: string | null;
    instagram: string | null;
    x_twitter: string | null;
    youtube: string | null;
    whatsapp: string | null;
  };
}

const SocialLinks: React.FC<SocialLinksProps> = ({ dietitian }) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      justifyContent="center"
      mb={2}
    >
      {dietitian.facebook && (
        <Button
          variant="outlined"
          href={dietitian.facebook}
          target="_blank"
          size="small"
        >
          Facebook
        </Button>
      )}
      {dietitian.instagram && (
        <Button
          variant="outlined"
          href={dietitian.instagram}
          target="_blank"
          size="small"
        >
          Instagram
        </Button>
      )}
      {dietitian.x_twitter && (
        <Button
          variant="outlined"
          href={dietitian.x_twitter}
          target="_blank"
          size="small"
        >
          Twitter
        </Button>
      )}
      {dietitian.youtube && (
        <Button
          variant="outlined"
          href={dietitian.youtube}
          target="_blank"
          size="small"
        >
          YouTube
        </Button>
      )}
      {dietitian.whatsapp && (
        <Button
          variant="outlined"
          href={`https://wa.me/${dietitian.whatsapp}`}
          target="_blank"
          size="small"
        >
          WhatsApp
        </Button>
      )}
    </Stack>
  );
};

export default SocialLinks;
