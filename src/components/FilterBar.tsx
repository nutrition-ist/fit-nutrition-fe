import React, { FC } from "react";
import { useMediaQuery } from "@mui/material";
import DesktopFilterBar from "./DesktopFilterBar";
import MobileFilterBar, { MobileFilterBarProps } from "./MobileFilterBar";

export type ResponsiveFilterBarProps = MobileFilterBarProps;

const FilterBar: FC<ResponsiveFilterBarProps> = (props) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return isMobile ? (
    <MobileFilterBar {...props} />
  ) : (
    <DesktopFilterBar {...props} />
  );
};

export default FilterBar;
