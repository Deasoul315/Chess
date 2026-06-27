"use client";

import SideBar from "@/shared/components/Shell/SideBar";
import { AppShell, Burger, Stack, Tabs } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  GraphIcon,
  HouseIcon,
  LogIcon,
  MonitorIcon,
  PersonIcon,
  PlayIcon,
  SignInIcon,
  TrendUpIcon,
  UserIcon,
} from "@phosphor-icons/react";
import NavBar from "./NavBar";
import React from "react";
import UserForm from "../UserSignUpForm";
import UserSignUpForm from "../UserSignUpForm";
import UserSignInForm from "../UserSignInForm";
import { useUserDataContext } from "@/shared/contexts/UserData";

const Shell = ({ children }: { children: React.ReactNode }) => {
  const userData = useUserDataContext();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <AppShell
      padding="md"
      // styles={{
      //   header: {
      //     padding: "0 20px",
      //   },
      // }}
      header={{ height: 60 }}
      navbar={{
        width: { base: 40 },
        breakpoint: 0,
        collapsed: { mobile: true },
      }}
    >
      <AppShell.Header
        style={{
          zIndex: 200,
        }}
        display={"flex"}
        className="items-center"
      >
        <NavBar
          logo={{ icon: "/logo.png", text: "Chess" }}
          form={
            <Stack>
              <Tabs defaultValue="signIn">
                <Tabs.List>
                  <Tabs.Tab
                    value="signUp"
                    leftSection={<LogIcon size={12} />}
                    styles={{
                      tab: {
                        fontSize: isMobile
                          ? "var(--header-5)"
                          : "var(--header-4)",
                        fontWeight: "var(--bold)",
                      },
                    }}
                  >
                    Sign Up
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="signIn"
                    leftSection={<SignInIcon size={12} />}
                    styles={{
                      tab: {
                        fontSize: isMobile
                          ? "var(--header-5)"
                          : "var(--header-4)",
                        fontWeight: "var(--bold)",
                      },
                    }}
                  >
                    Sign In
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="signIn">
                  <UserSignInForm></UserSignInForm>
                </Tabs.Panel>

                <Tabs.Panel value="signUp">
                  <UserSignUpForm></UserSignUpForm>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          }
        ></NavBar>
      </AppShell.Header>

      <AppShell.Navbar>
        <SideBar
          links={
            userData.value.userName
              ? [
                  { icon: HouseIcon, label: "Home", resource: "/" },
                  {
                    icon: MonitorIcon,
                    label: "Dashboard",
                    resource: "/dashboard",
                  },
                  { icon: PlayIcon, label: "Play", resource: "/play" },
                  { icon: UserIcon, label: "Account", resource: "/account" },
                ]
              : [
                  { icon: HouseIcon, label: "Home", resource: "/" },
                  {
                    icon: MonitorIcon,
                    label: "Dashboard",
                    resource: "/dashboard",
                  },
                ]
          }
        ></SideBar>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default Shell;
