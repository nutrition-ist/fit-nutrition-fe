"use client";

import React, { createContext, useContext, useState } from "react";

interface Dietitian {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  about_me: string | null;
  profile_picture: string | null;
  address: string;
}

interface DietitianContextType {
  dietitians: Dietitian[];
  setDietitians: React.Dispatch<React.SetStateAction<Dietitian[]>>;
}

const DietitianContext = createContext<DietitianContextType | undefined>(
  undefined
);

export const DietitianProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);

  return (
    <DietitianContext.Provider value={{ dietitians, setDietitians }}>
      {children}
    </DietitianContext.Provider>
  );
};

export const useDietitianContext = (): DietitianContextType => {
  const context = useContext(DietitianContext);
  if (!context) {
    throw new Error(
      "useDietitianContext must be used within a DietitianProvider"
    );
  }
  return context;
};
