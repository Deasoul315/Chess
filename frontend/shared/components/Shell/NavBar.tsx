"use client";

import { useAppContext } from "@/shared/contexts/App";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useSignOutUser } from "@/shared/services/api/hooks/user/useSignOutUser";
import {
  ActionIcon,
  Burger,
  Flex,
  Modal,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  DoorIcon,
  HeartIcon,
  ListDashesIcon,
  MoonIcon,
  PersonIcon,
  SignOutIcon,
  SunIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect } from "react";

const NavBar = ({
  logo,
  form,
}: {
  logo: {
    icon: string;
    text: string;
  };
  form?: React.ReactNode;
}) => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const userData = useUserDataContext();
  const useSignOut = useSignOutUser();
  const app = useAppContext();

  useEffect(() => {
    if (userData.value.userName === "") return;

    app.didPressSignupCloseFn();
  }, [userData.value.userName]);

  return (
    <div className="bg-(--primary) text-(--text) w-full h-full flex items-center px-2">
      <Flex justify={"space-between"} w={"100%"} align={"center"}>
        {/* left */}
        <div className="flex items-center gap-2">
          <ActionIcon
            bg={"var(--primary)"}
            c={"var(--text)"}
            size={40}
            onClick={app.toggleSideBar}
            hiddenFrom="md"
          >
            <ListDashesIcon size={"100%"}></ListDashesIcon>
          </ActionIcon>
          <Image src={logo.icon} width={40} height={40} alt=""></Image>
          {/* <h1 className="text-(length:--mantine-font-size-mySize)">text</h1> */}
          <Title visibleFrom="md" order={1}>
            {logo.text}
          </Title>
          <Title hiddenFrom="md" order={6}>
            {logo.text}
          </Title>
        </div>

        {/* right */}
        <div className="flex gap-1">
          {form &&
            (userData.value.name === "" ? (
              <ActionIcon
                // variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                // gradient={{ from: "blue", to: "cyan", deg: 90 }}
                bg={"red"}
                onClick={app.didPressSignupOpenFn}
              >
                <UserIcon size={30}></UserIcon>
              </ActionIcon>
            ) : (
              <ActionIcon
                // variant="gradient"
                size="xl"
                aria-label="Gradient action icon"
                // gradient={{ from: "blue", to: "cyan", deg: 90 }}
                bg={"red"}
                onClick={() => {
                  localStorage.clear();
                  useSignOut.mutate();
                }}
              >
                <SignOutIcon size={30}></SignOutIcon>
              </ActionIcon>
            ))}
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="xl"
            aria-label="Toggle color scheme"
          >
            <SunIcon
              size={30}
              className={computedColorScheme === "light" ? "block" : "hidden"}
            />
            <MoonIcon
              size={30}
              className={computedColorScheme === "light" ? "hidden" : "block"}
            />
          </ActionIcon>
        </div>
      </Flex>
      <Modal
        opened={app.didPressSignup}
        onClose={app.didPressSignupCloseFn}
        title={
          <>
            <Text fz={"var(--header-5)"} hiddenFrom="md" fw="var(--bold)">
              Authentication
            </Text>

            <Text fz={"var(--header-3)"} visibleFrom="md" fw="var(--bold)">
              Authentication
            </Text>
          </>
        }
      >
        {form}
      </Modal>
    </div>
  );
};

export default NavBar;
