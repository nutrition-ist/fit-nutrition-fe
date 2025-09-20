"use client";

import React from "react";
import DietitianBookingPanel from "@/components/DietitianBookingPanel";

interface Props {
  dieticianId: number;
}
//Without this we get a lovely "ssr: false is not allowed with next/dynamic in Server" error
const DietitianBookingSection: React.FC<Props> = ({ dieticianId }) => {
  return <DietitianBookingPanel dietitianId={dieticianId} />;
};

export default DietitianBookingSection;
