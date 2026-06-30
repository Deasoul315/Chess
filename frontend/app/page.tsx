"use client";

import { AGATE_GROTESK } from "@/shared/constants/constants";
import { useAppContext } from "@/shared/contexts/App";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useGetUserData } from "@/shared/services/api/hooks/user/useGetUserData";
import { useRefreshUser } from "@/shared/services/api/hooks/user/useRefreshToken";
import { useGSAP } from "@gsap/react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Highlight,
  Mark,
  Marquee,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { GameControllerIcon } from "@phosphor-icons/react";

import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
gsap.registerPlugin(ScrollTrigger);

function PlayNowSection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const buttonRef = useRef(null);
  const app = useAppContext();
  const user = useUserDataContext();

  useGSAP(() => {
    if (!sectionRef.current || !contentRef.current || !buttonRef.current)
      return;

    gsap.from(contentRef.current, {
      opacity: 0,
      y: 100,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 50%",
        end: "bottom 50%",
      },
    });

    gsap.from(buttonRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 2,
      delay: 0.2,
      ease: "back.out(1.7)",
      scrollTrigger: {
        scrub: 5,
        trigger: sectionRef.current,
        start: "top 50%",
        end: "bottom 50%",
      },
    });
  }, []);

  return (
    <Stack align="center" justify="center" h={"100vh"} w={"100wh"}>
      <Grid ref={sectionRef} py={100}>
        <Grid.Col span={12}>
          <Center>
            <Stack ref={contentRef} align="center" gap="md">
              <Title order={4} hiddenFrom="md" ta="center">
                Ready to Play?
              </Title>

              <Title order={2} visibleFrom="md" ta="center">
                Ready to Play?
              </Title>

              <Text
                opacity={0.7}
                size="md"
                ta="center"
                maw={500}
                hiddenFrom="md"
              >
                Challenge yourself in a game of chess. Improve your strategy,
                learn new tactics, and play against strong opponents.
              </Text>

              <Text
                opacity={0.7}
                size="lg"
                ta="center"
                maw={500}
                visibleFrom="md"
              >
                Challenge yourself in a game of chess. Improve your strategy,
                learn new tactics, and play against strong opponents.
              </Text>

              {user.value.userName !== "" ? (
                <Link href={"/play"}>
                  <Button
                    ref={buttonRef}
                    size="lg"
                    radius="xl"
                    color="primary"
                    fz={{ base: "md", md: "lg" }}
                  >
                    Play Now
                  </Button>
                </Link>
              ) : (
                <Button
                  ref={buttonRef}
                  size="lg"
                  radius="xl"
                  color="primary"
                  fz={{ base: "md", md: "lg" }}
                  onClick={app.didPressSignupOpenFn}
                >
                  Sign Up
                </Button>
              )}
            </Stack>
          </Center>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function Counter({
  value,
  duration = 2,
}: {
  value: number;
  duration?: number;
}) {
  const elementRef = useRef<null | HTMLHeadingElement>(null);
  useGSAP(() => {
    const obj = { value: 0 };
    gsap.to(obj, {
      duration: duration,
      value: value,
      snap: { value: 1 },
      onUpdate: () => {
        if (!elementRef.current) return;
        elementRef.current.textContent = obj.value.toLocaleString();
      },
      scrollTrigger: {
        trigger: elementRef.current,
        start: "top bottom", // when the top of the trigger hits the top of the viewport
        end: "+=500", // end after scrolling 500px beyond the start
        scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
        snap: {
          snapTo: "labels", // snap to the closest label in the timeline
          duration: { min: 0.2, max: 3 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
          delay: 0.2, // wait 0.2 seconds from the last scroll event before doing the snapping
          ease: "power1.inOut", // the ease of the snap animation ("power3" by default)
        },
      },
    });
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return <Title order={isDesktop ? 3 : 5} ref={elementRef} />;
}
function ChessSection() {
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const sectionRef = useRef(null);

  useGSAP(() => {
    if (
      !imageContainerRef.current ||
      !textRef.current ||
      !sectionRef.current ||
      !imageRef.current
    )
      return;

    gsap.from(imageContainerRef.current, {
      width: 0,
      opacity: 0,
      scale: 2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",
        end: "bottom 70%",
        scrub: 5,
      },
    });

    gsap.from(textRef.current, {
      opacity: 0,
      x: 200,
      ease: "power1.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",
        end: "bottom 70%",
        scrub: 5,
      },
    });
  }, []);

  return (
    <Grid ref={sectionRef} gap={"50px"}>
      {/* IMAGE */}
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Flex justify={{ base: "center", md: "right" }}>
          <div className="h-50 w-50 md:w-100 md:h-100 overflow-hidden">
            <div
              className="h-50 w-50 md:w-100 md:h-100"
              ref={imageContainerRef}
            >
              <Image
                src="/chess.webp"
                height={200}
                width={400}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  flexShrink: 0,
                  objectFit: "cover",
                  objectPosition: "top left",
                }}
                ref={imageRef}
              />
            </div>
          </div>
        </Flex>
      </Grid.Col>

      {/* TEXT */}
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Stack ref={textRef} justify="center" h="100%">
          <Title order={4} c="primary" hiddenFrom="md">
            Le Chess
          </Title>

          <Title order={2} c="primary" visibleFrom="md">
            Le Chess
          </Title>

          <Text opacity="70%" size="md" hiddenFrom="md">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga,
            praesentium placeat. Aliquam, accusantium animi voluptatum omnis
            praesentium sequi mollitia! Adipisci quam odio non ea ipsam quisquam
            repellat debitis vel tempora.
          </Text>

          <Text opacity="70%" size="lg" visibleFrom="md">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga,
            praesentium placeat. Aliquam, accusantium animi voluptatum omnis
            praesentium sequi mollitia! Adipisci quam odio non ea ipsam quisquam
            repellat debitis vel tempora.
          </Text>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
const Home = () => {
  const userData = useUserDataContext();
  const useRefresh = useRefreshUser();
  const getUserInfo = useGetUserData({
    accessToken: userData.value.accessToken,
  });

  useEffect(() => {
    if (userData.value.accessToken !== "") return;

    useRefresh.mutate();
  }, []);

  useEffect(() => {
    if (!getUserInfo.error) return;

    userData.set({ accessToken: "", userName: "", name: "" });
    const error = getUserInfo.error;
    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [getUserInfo.isError]);

  useEffect(() => {
    if (userData.value.accessToken === "" || !getUserInfo.isSuccess) return;

    const user = getUserInfo.data.user;
    userData.set({
      ...userData.value,
      userName: user.userName,
      name: user.name,
    });
  }, [getUserInfo.isSuccess]);
  useGSAP(() => {
    gsap.from("#title", {
      y: -200,
      duration: 1,
      ease: "bounce.out",
      opacity: 0,
      rotation: -30,
    });
    gsap.from("#description", {
      y: 200,
      duration: 1,
      ease: "bounce.out",
      opacity: 0,
      rotation: 30,
    });

    gsap.from("#counter", {
      duration: 2,
      x: -200,
      ease: "expo",
      opacity: 0,
      scrollTrigger: {
        trigger: "#counter",
        start: "top bottom", // when the top of the trigger hits the top of the viewport
        end: "+=500", // end after scrolling 500px beyond the start
        scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
        snap: {
          snapTo: "labels", // snap to the closest label in the timeline
          duration: { min: 0.2, max: 3 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
          delay: 0.2, // wait 0.2 seconds from the last scroll event before doing the snapping
          ease: "power1.inOut", // the ease of the snap animation ("power3" by default)
        },
      },
    });
    gsap.to("#text", {
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: "#text",
        pin: true, // pin the trigger element while active
        start: "top top", // when the top of the trigger hits the top of the viewport
        end: "+=500", // end after scrolling 500px beyond the start
        scrub: 1, // smooth scrubbing, takes 1 second to "catch up" to the scrollbar
        snap: {
          snapTo: "labels", // snap to the closest label in the timeline
          duration: { min: 0.2, max: 3 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
          delay: 0.2, // wait 0.2 seconds from the last scroll event before doing the snapping
          ease: "power1.inOut", // the ease of the snap animation ("power3" by default)
        },
      },
    });
  });

  return (
    <div style={{ overflow: "hidden" }} className="text-(--text)">
      <Stack align="center">
        <Stack
          align="center"
          maw={700}
          w={"80%"}
          h={"calc(100vh - 130px)"}
          justify="center"
          id="text"
        >
          <Stack align="center" justify="center" gap={"xs"}>
            <Title
              ta={"center"}
              visibleFrom="md"
              order={1}
              id="title"
              lh={"1.1"}
            >
              Chess{" "}
              <Paper
                bg="var(--primary)"
                display={"inline"}
                c={"var(--background)"}
                px={"xs"}
              >
                hub
              </Paper>
            </Title>
            <Title
              ta={"center"}
              hiddenFrom="md"
              order={3}
              id="title"
              lh={"1.1"}
            >
              Chess{" "}
              <Paper
                bg="var(--primary)"
                display={"inline"}
                c={"var(--background)"}
                px={"xs"}
              >
                hub
              </Paper>
            </Title>

            <Title
              ta={"center"}
              visibleFrom="md"
              order={1}
              id="title"
              lh={"1.1"}
            >
              Never Forget Your{" "}
              <Paper
                bg="var(--primary)"
                display={"inline"}
                c={"var(--background)"}
                px={"xs"}
              >
                Openings
              </Paper>
            </Title>
            <Title
              ta={"center"}
              hiddenFrom="md"
              order={3}
              id="title"
              lh={"1.1"}
            >
              Never Forget Your{" "}
              <Paper
                bg="var(--primary)"
                display={"inline"}
                c={"var(--background)"}
                px={"xs"}
              >
                Openings
              </Paper>
            </Title>
          </Stack>
          <Text
            ta={"center"}
            hiddenFrom="md"
            size="md"
            id="description"
            opacity={"70%"}
          >
            Chessable uses science-backed learning techniques to help boost your
            retention by up to 95%. Play the opening like a book, the middlegame
            like a magician, and the endgame like a machine.
          </Text>
          <Text
            ta={"center"}
            visibleFrom="md"
            size="lg"
            id="description"
            opacity={"70%"}
          >
            Chessable uses science-backed learning techniques to help boost your
            retention by up to 95%. Play the opening like a book, the middlegame
            like a magician, and the endgame like a machine.
          </Text>
        </Stack>
        <Marquee gap="lg" bg={"var(--secondary)"} duration={18000}>
          <Text fz={{ base: "md", md: "lg" }}>Rook</Text>
          <Text fz={{ base: "md", md: "lg" }}>Knight</Text>
          <Text fz={{ base: "md", md: "lg" }}>Bishop</Text>
          <Text fz={{ base: "md", md: "lg" }}>Queen</Text>
          <Text fz={{ base: "md", md: "lg" }}>King</Text>
          <Text fz={{ base: "md", md: "lg" }}>Bishop</Text>
          <Text fz={{ base: "md", md: "lg" }}>Knight</Text>
          <Text fz={{ base: "md", md: "lg" }}>Rook</Text>
          <Text fz={{ base: "md", md: "lg" }}>Rook</Text>
          <Text fz={{ base: "md", md: "lg" }}>Knight</Text>
          <Text fz={{ base: "md", md: "lg" }}>Bishop</Text>
          <Text fz={{ base: "md", md: "lg" }}>Queen</Text>
          <Text fz={{ base: "md", md: "lg" }}>King</Text>
          <Text fz={{ base: "md", md: "lg" }}>Bishop</Text>
          <Text fz={{ base: "md", md: "lg" }}>Knight</Text>
          <Text fz={{ base: "md", md: "lg" }}>Rook</Text>
        </Marquee>
      </Stack>

      {/* tournaments bar */}
      <Grid
        style={{
          background:
            "linear-gradient(90deg,rgba(252, 163, 17, 0.01) 0%, rgba(252, 163, 17, 1) 25%, rgba(252, 163, 17, 1) 50%, rgba(252, 163, 17, 1) 75%, rgba(252, 163, 17, 0.01) 100%)",
        }}
      >
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Stack align="center" justify="center" gap={0} id="counter">
            <Counter value={180} />

            <Title order={6} lh="1.1" hiddenFrom="md">
              Tournaments
            </Title>

            <Title order={3} lh="1.1" visibleFrom="md">
              Tournaments
            </Title>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Stack align="center" justify="center" gap={0} id="counter">
            <Counter value={180} />

            <Title order={6} lh="1.1" hiddenFrom="md">
              Tournaments
            </Title>

            <Title order={3} lh="1.1" visibleFrom="md">
              Tournaments
            </Title>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Stack align="center" justify="center" gap={0} id="counter">
            <Counter value={180} />

            <Title order={6} lh="1.1" hiddenFrom="md">
              Tournaments
            </Title>

            <Title order={3} lh="1.1" visibleFrom="md">
              Tournaments
            </Title>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <Stack align="center" justify="center" gap={0} id="counter">
            <Counter value={180} />

            <Title order={6} lh="1.1" hiddenFrom="md">
              Tournaments
            </Title>

            <Title order={3} lh="1.1" visibleFrom="md">
              Tournaments
            </Title>
          </Stack>
        </Grid.Col>
      </Grid>

      <Grid p={"md"}>
        <ChessSection></ChessSection>
        <ChessSection></ChessSection>
        <ChessSection></ChessSection>
        <ChessSection></ChessSection>
      </Grid>

      <PlayNowSection></PlayNowSection>
    </div>
  );
};

export default Home;
