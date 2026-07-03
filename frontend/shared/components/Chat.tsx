import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Drawer,
  Flex,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect, useRef } from "react";
import { useMatchContext } from "../contexts/Match";
import { useUserDataContext } from "../contexts/UserData";
import { Message } from "../constants/types";
import { reverse } from "../utilities/utilities";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ChatIcon } from "@phosphor-icons/react";

function ChatCore({
  messages,
}: {
  messages: {
    private: Message[];
    public: Message[];
  };
}) {
  const match = useMatchContext();
  const userData = useUserDataContext();
  const form = useForm({
    initialValues: {
      message: "",
    },

    validate: {
      message: (value: string) =>
        value.length > 0 && value.length < 200 ? null : "Invalid message",
    },
  });
  const defaultVal =
    match.value.activeChat === "PRIVATE" ? "private" : "public";
  const isMobile = useMediaQuery("(max-width: 1700px)");
  const CHAT_HEIGHT = isMobile ? "75vh" : "200px";
  return (
    <Tabs
      value={defaultVal}
      onChange={(value) => {
        let chatType: "PUBLIC" | "PRIVATE" = "PUBLIC";
        if (!value)
          chatType = match.value.activeChat ? match.value.activeChat : chatType;
        else if (value === "private") chatType = "PRIVATE";
        else if (value === "public") chatType = "PUBLIC";

        match.dispatch({
          type: "SWITCH_CHAT",
          params: {
            chatType: chatType,
          },
        });
      }}
    >
      <Tabs.List>
        {match.value.role === "PLAYER" ? (
          <Tabs.Tab value="private">
            <Flex align={"center"} gap={"xs"}>
              <Title order={isMobile ? 4 : 3}>Private</Title>
              {match.value.messages.private.length -
                match.value.seenIndicies.private >
              0 ? (
                <Badge bg={"red"} circle size="lg">
                  {match.value.messages.private.length -
                    match.value.seenIndicies.private}
                </Badge>
              ) : (
                ""
              )}
            </Flex>
          </Tabs.Tab>
        ) : (
          ""
        )}
        <Tabs.Tab value="public">
          <Flex align={"center"} gap={"xs"}>
            <Title order={isMobile ? 4 : 3}>Public</Title>
            {match.value.messages.public.length -
              match.value.seenIndicies.public >
            0 ? (
              <Badge bg={"red"} circle size="lg">
                {match.value.messages.public.length -
                  match.value.seenIndicies.public}
              </Badge>
            ) : (
              ""
            )}
          </Flex>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="private">
        <Stack>
          <ScrollArea h={CHAT_HEIGHT}>
            <Flex direction={"column-reverse"}>
              {reverse([...messages.private]).map(
                (message: Message, i: number) => (
                  <Flex key={i} gap={"xs"}>
                    <Text size={isMobile ? "md" : "lg"}>
                      {message.userName}:
                    </Text>
                    <Text size={isMobile ? "md" : "lg"}>{message.message}</Text>
                  </Flex>
                ),
              )}
            </Flex>
          </ScrollArea>
        </Stack>
        <form
          onSubmit={form.onSubmit((values) => {
            match.dispatch({
              type: "ADD_MESSAGE",
              params: {
                userName: userData.value.userName,
                message: values.message,
                domain: "PRIVATE",
              },
            });
            match.value.socket?.send(
              JSON.stringify({
                type: "MESSAGE",
                userType: match.value.role,
                domain: "PRIVATE",
                message: values.message,
              }),
            );
            form.reset();
          })}
        >
          <Flex justify={"center"} align={"center"} gap={"xs"}>
            <TextInput
              w={190}
              {...form.getInputProps("message")}
              placeholder="Input"
              size="lg"
            ></TextInput>
            <Button
              color="var(--primary)"
              type="submit"
              size={isMobile ? "md" : "lg"}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Tabs.Panel>

      <Tabs.Panel value="public">
        <Stack>
          <ScrollArea h={CHAT_HEIGHT}>
            <Flex direction={"column-reverse"}>
              {reverse([...messages.public]).map(
                (message: Message, i: number) => (
                  <Flex key={i} gap={"xs"}>
                    <Text size={isMobile ? "md" : "lg"}>
                      {message.userName}:
                    </Text>
                    <Text size={isMobile ? "md" : "lg"}>{message.message}</Text>
                  </Flex>
                ),
              )}
            </Flex>
          </ScrollArea>
        </Stack>
        <form
          onSubmit={form.onSubmit((values) => {
            match.dispatch({
              type: "ADD_MESSAGE",
              params: {
                userName: userData.value.userName,
                message: values.message,
                domain: "PUBLIC",
              },
            });
            match.value.socket?.send(
              JSON.stringify({
                type: "MESSAGE",
                userType: match.value.role,
                domain: "PUBLIC",
                message: values.message,
              }),
            );
            form.reset();
          })}
        >
          <Flex justify={"center"} align={"center"} gap={"xs"}>
            <TextInput
              w={190}
              {...form.getInputProps("message")}
              placeholder="Input"
              size="lg"
            ></TextInput>
            <Button
              color="var(--primary)"
              type="submit"
              size={isMobile ? "md" : "lg"}
            >
              Send
            </Button>
          </Flex>
        </form>
      </Tabs.Panel>
    </Tabs>
  );
}

const Chat = ({
  messages,
}: {
  messages: {
    private: Message[];
    public: Message[];
  };
}) => {
  // const hostViewport = useRef<HTMLDivElement>(null);
  // const guestViewport = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!hostViewport || !guestViewport) return;

  //   hostViewport.current!.scrollTo({
  //     top: hostViewport.current!.scrollHeight,
  //     behavior: "smooth",
  //   });
  //   guestViewport.current!.scrollTo({
  //     top: guestViewport.current!.scrollHeight,
  //     behavior: "smooth",
  //   });
  // }, [data]);
  const match = useMatchContext();
  const isMobile = useMediaQuery("(max-width: 48em)");
  const isPC = useMediaQuery("(max-width: 1700px)");
  const [opened, { open, close }] = useDisclosure(false);
  return !isPC ? (
    <Paper bg={"var(--secondary)"} p={"xs"}>
      <ChatCore messages={messages}></ChatCore>
    </Paper>
  ) : (
    <Flex pos={"relative"}>
      <Drawer
        offset={8}
        radius="md"
        opened={opened}
        onClose={close}
        title="Chat"
        styles={{
          title: {
            fontSize: "var(--header-3)",
            fontWeight: "var(--bold)",
          },
        }}
      >
        <ChatCore messages={messages}></ChatCore>
      </Drawer>
      {opened ? (
        ""
      ) : (
        <ActionIcon
          radius={"xl"}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 100,
            overflow: "visible",
          }}
          variant="default"
          onClick={open}
          size={50}
          p={"xs"}
        >
          <ChatIcon size={40}></ChatIcon>
          {match.value.messages.private.length -
            match.value.seenIndicies.private +
            (match.value.messages.public.length -
              match.value.seenIndicies.public) >
          0 ? (
            <Badge
              bg={"red"}
              circle
              size="lg"
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                zIndex: 101,
              }}
            >
              {match.value.messages.private.length -
                match.value.seenIndicies.private +
                (match.value.messages.public.length -
                  match.value.seenIndicies.public)}
            </Badge>
          ) : (
            ""
          )}
        </ActionIcon>
      )}
    </Flex>
  );
};

export default Chat;
