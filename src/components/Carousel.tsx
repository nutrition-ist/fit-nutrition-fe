"use client";

import React, { FC } from "react";
import Slider from "react-slick";
import { Box, Container, Typography } from "@mui/material";
import TestimonialCard, { TestimonialCardProps } from "./TestimonialCard";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const arrowSx = {
  "& svg": { fontSize: 32, color: "#007560" },
  cursor: "pointer",
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
};

function PrevArrow({
  className,
  style,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  currentSlide?: number;
  slideCount?: number;
}) {
  return (
    <Box
      className={className}
      sx={{ ...arrowSx, left: -10 }}
      style={style}
      onClick={onClick}
    >
      <ArrowBackIosNewIcon />
    </Box>
  );
}

function NextArrow({
  className,
  style,
  onClick,
}: {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  currentSlide?: number;
  slideCount?: number;
}) {
  return (
    <Box
      className={className}
      sx={{ ...arrowSx, right: -10 }}
      style={style}
      onClick={onClick}
    >
      <ArrowForwardIosIcon />
    </Box>
  );
}

export interface CarouselProps {
  items: TestimonialCardProps[];
  title?: string;
  bgcolor?: string;
}

const Carousel: FC<CarouselProps> = ({
  items,
  title = "Featured Comments by Clients",
  bgcolor = "#e6f1ef",
}) => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 6000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Box sx={{ bgcolor, py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
        >
          {title}
        </Typography>

        <Slider {...settings}>
          {items.map((t) => (
            <Box key={t.name} px={2}>
              <TestimonialCard {...t} />
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
};

export default Carousel;
