"use client";
import Lobby from "@/shared/components/Lobby";
import { useMatchContext } from "@/shared/contexts/Match";

const page = () => {
  const match = useMatchContext();
  console.log(match.value.socket);
  return <Lobby></Lobby>;
};

export default page;
