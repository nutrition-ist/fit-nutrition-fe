import React, { FC } from "react";
import Image, { StaticImageData } from "next/image";
import { Card, CardContent, Typography } from "@mui/material";

export interface ServiceCardProps {
  title: string;
  img: string | StaticImageData;
  href?: string;
}

const ServiceCard: FC<ServiceCardProps> = ({ title, img, href }) => {
  const content = (
    <Card elevation={0} sx={{ borderRadius: 3 }}>
      <Image
        src={typeof img === "string" ? img : img.src}
        alt={title}
        width={600}
        height={400}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: 12,
        }}
      />

      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return href ? (
    <a href={href} style={{ textDecoration: "none" }}>
      {content}
    </a>
  ) : (
    content
  );
};

export default ServiceCard;
