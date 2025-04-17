// components/FeatureRow.tsx
import React, { FC } from "react";
import Image, { StaticImageData } from "next/image";
import { Grid, Typography, Box } from "@mui/material";

export interface FeatureRowProps {
  title: string;
  description: string;
  img: string | StaticImageData; // allow imported for future mayber
  reverse?: boolean; // true = image on the right
}

const FeatureRow: FC<FeatureRowProps> = ({
  title,
  description,
  img,
  reverse = false,
}) => (
  <Grid
    container
    spacing={4}
    direction={reverse ? "row-reverse" : "row"}
    alignItems="center"
    sx={{ mb: { xs: 6, md: 10 } }}
  >
    {/*IMAGE*/}
    <Grid item xs={12} md={6}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: "56.25%",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Image
          src={typeof img === "string" ? img : img.src}
          alt={title}
          fill
          priority={false}
          sizes="(min-width:960px) 50vw, 100vw"
          style={{ objectFit: "cover" }}
        />
      </Box>
    </Grid>

    {/*TEXT*/}
    <Grid item xs={12} md={6}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#007560", mb: 2 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 520 }}>
        {description}
      </Typography>
    </Grid>
  </Grid>
);

export default FeatureRow;
