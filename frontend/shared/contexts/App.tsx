"use client";

import { useDisclosure } from "@mantine/hooks";
import React, { createContext, useContext, useState } from "react";

type AppContextType = {
  didPressSignup: boolean;
  didPressSignupOpenFn: () => void;
  didPressSignupCloseFn: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    didPressSignup,
    { open: didPressSignupOpenFn, close: didPressSignupCloseFn },
  ] = useDisclosure(false);

  return (
    <AppContext.Provider
      value={{
        didPressSignup,
        didPressSignupOpenFn,
        didPressSignupCloseFn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be inside AppContextProvider");
  }

  return context;
}
