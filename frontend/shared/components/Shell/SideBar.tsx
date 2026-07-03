import { useAppContext } from "@/shared/contexts/App";
import { useMatchContext } from "@/shared/contexts/Match";
import { Flex, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { HeartIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const SideBar = ({
  links,
  isCollapse,
}: {
  links: {
    icon: any;
    label: string;
    resource: string;
  }[];
  isCollapse: boolean;
}) => {
  let path = usePathname().replace("/", "");
  path = path === "" ? "home" : path;
  const [activeLink, setActiveLink] = useState(path);
  const queryClient = useQueryClient();
  const match = useMatchContext();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const app = useAppContext();
  const mainLinks =
    isCollapse && !isMobile
      ? links.map((link) => (
          <Tooltip
            label={link.label}
            position="right"
            withArrow
            transitionProps={{ duration: 0 }}
            key={link.label}
            fz={"lg"}
          >
            <UnstyledButton
              onClick={() => {
                setActiveLink(link.label.toLowerCase());

                match.dispatch({ type: "RESET", params: {} });
                queryClient.invalidateQueries();
                queryClient.resetQueries();
              }}
              data-active={link.label === activeLink || undefined}
              aria-label={link.label}
              bg={
                link.label.toLowerCase() === activeLink
                  ? "var(--background)"
                  : ""
              }
              bd={
                link.label.toLowerCase() === activeLink
                  ? "1px solid var(--secondary)"
                  : "0px"
              }
              bdrs={"md"}
              p={"2px"}
            >
              <Link href={link.resource}>
                <link.icon size={40} />
              </Link>
            </UnstyledButton>
          </Tooltip>
        ))
      : links.map((link) => (
          <Link href={link.resource} key={link.label}>
            <Flex
              gap={"sm"}
              align={"center"}
              onClick={() => {
                app.closeSideBar();
                setActiveLink(link.label.toLowerCase());
                match.dispatch({ type: "RESET", params: {} });
                queryClient.invalidateQueries();
                queryClient.resetQueries();
              }}
              bg={
                link.label.toLowerCase() === activeLink
                  ? "var(--background)"
                  : ""
              }
              bd={
                link.label.toLowerCase() === activeLink
                  ? "1px solid var(--secondary)"
                  : "0px"
              }
              bdrs={"md"}
              p={"2px"}
            >
              <UnstyledButton
                onClick={() => {
                  match.dispatch({ type: "RESET", params: {} });
                  queryClient.invalidateQueries();
                  queryClient.resetQueries();
                }}
                data-active={link.label === activeLink || undefined}
                aria-label={link.label}
              >
                <link.icon size={40} />
              </UnstyledButton>
              <Text size="lg">{link.label}</Text>
            </Flex>
          </Link>
        ));

  //   const links = linksMockdata.map((link) => (
  //     <a
  //       className={classes.link}
  //       data-active={activeLink === link || undefined}
  //       href="#"
  //       onClick={(event) => {
  //         event.preventDefault();
  //         setActiveLink(link);
  //       }}
  //       key={link}
  //     >
  //       {link}
  //     </a>
  //   ));

  return (
    <nav
      className={
        "bg-(--primary) text-(--text) w-full h-full flex p-(--spacing-lg) overflow-hidden " +
        (isCollapse ? "justify-center" : "")
      }
    >
      <div className="flex w-full flex-col align-center text-(length:--text-md) gap-(--spacing-sm)">
        {mainLinks}
      </div>
    </nav>
  );
};

export default SideBar;
