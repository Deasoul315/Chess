"use client";

import { createContext, useContext, useState } from "react";
import { UserData } from "../types/types";
import React from "react";

const initUserData: UserData = {
  userName: "",
  name: "",
  // totalPoints: 0,
  // matchesPlayedCount: 0,
  // countEarnedMatches: 0,
  // countLostMatches: 0,
  // status: "OFFLINE",
};

type UserDataContext = {
  value: UserData;
  set: React.Dispatch<React.SetStateAction<UserData>>;
};

const UserDataContext = createContext<UserDataContext | null>(null);

export const UserDataContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userData, setUserData] = useState(initUserData);

  return (
    <UserDataContext.Provider value={{ value: userData, set: setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export function useUserDataContext() {
  const userData = useContext(UserDataContext);

  if (!userData) throw "user data context is empty";

  return userData;
}
