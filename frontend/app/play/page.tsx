"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lobby from "@/shared/components/Lobby";
import { useMatchContext } from "@/shared/contexts/Match";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const user = useUserDataContext();
  const match = useMatchContext();

  useEffect(() => {
    if (user.value.userName === "") {
      router.replace("/Home");
    }
  }, [user, router]);

  if (user.value.userName === "") {
    return null;
  }

  return <Lobby />;
}
