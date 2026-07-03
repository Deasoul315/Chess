"use client";

import SideBar from "@/shared/components/Shell/SideBar";
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  CloseIcon,
  Flex,
  Stack,
  Tabs,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  ArrowArcLeftIcon,
  ArrowLineLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
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
import { ArrowElbowLeftUpIcon } from "@phosphor-icons/react/dist/ssr";
import { useAppContext } from "@/shared/contexts/App";

const Shell = ({ children }: { children: React.ReactNode }) => {
  const userData = useUserDataContext();
  const [isNavbarOpen, { toggle: toggleNavbar }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const app = useAppContext();
  return (
    <AppShell
      padding="md"
      // styles={{
      //   header: {
      //     padding: "0 20px",
      //   },
      // }}
      transitionDuration={250}
      header={{ height: 80 }}
      navbar={{
        width: isNavbarOpen ? "200px" : "95px",
        // breakpoint: 0,
        breakpoint: "md",
        collapsed: {
          mobile: !app.isOpenSideBar,
          desktop: isMobile ? true : false,
        },
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
        <Flex pos={"relative"} h={"100%"}>
          <SideBar
            isCollapse={!isNavbarOpen}
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
                    {
                      icon: UserIcon,
                      label: "Account",
                      resource: "/account",
                    },
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
          <Stack pos={"relative"} bg={"red"} h={"100%"} visibleFrom="md">
            <ActionIcon
              pos={"absolute"}
              top={"30px"}
              left={"0px"}
              bg={"var(--primary)"}
              onClick={toggleNavbar}
              size="lg"
              variant="subtle"
            >
              {isNavbarOpen ? (
                <CaretLeftIcon size={16} />
              ) : (
                <CaretRightIcon size={16} />
              )}
            </ActionIcon>
          </Stack>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default Shell;
