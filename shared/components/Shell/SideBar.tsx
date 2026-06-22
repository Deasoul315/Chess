import { Tooltip, UnstyledButton } from "@mantine/core";
import { HeartIcon } from "@phosphor-icons/react";
import Link from "next/link";
import React, { useState } from "react";

const SideBar = ({
  links,
}: {
  links: {
    icon: any;
    label: string;
    resource: string;
  }[];
}) => {
  const [active, setActive] = useState("Releases");
  const [activeLink, setActiveLink] = useState("Settings");

  const mainLinks = links.map((link) => (
    <Tooltip
      label={link.label}
      position="right"
      withArrow
      transitionProps={{ duration: 0 }}
      key={link.label}
    >
      <UnstyledButton
        onClick={() => setActive(link.label)}
        data-active={link.label === active || undefined}
        aria-label={link.label}
      >
        <Link href={link.resource}>
          <link.icon size={30} />
        </Link>
      </UnstyledButton>
    </Tooltip>
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
    <nav className="bg-(--primary) text-(--text) w-full h-full flex justify-center p-2">
      <div className="flex flex-col gap-3">{mainLinks}</div>
    </nav>
  );
};

export default SideBar;
