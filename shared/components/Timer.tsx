import { Stack, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { timeFormatter } from "../utilities/utilities";

const Timer = ({
  time,
  updaterFn,
}: {
  time: number;
  updaterFn: (time: number) => void;
}) => {
  const change = 1000;
  useEffect(() => {
    const interval = setInterval(() => {
      updaterFn(change);
    }, change);

    return () => clearInterval(interval);
  }, [updaterFn]);

  return (
    <Stack>
      <Text size="lg">{timeFormatter(time)}</Text>
    </Stack>
  );
};

export default Timer;
