import {
  Button,
  Container,
  Flex,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { useMatchContext } from "../contexts/Match";
import { useUserDataContext } from "../contexts/UserData";
import { Message } from "../constants/types";
import { reverse } from "../utilities/utilities";

const Chat = ({
  messages,
}: {
  messages: {
    private: Message[];
    public: Message[];
  };
}) => {
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

  return (
    <Paper bg={"var(--secondary)"} p={"xs"}>
      <Tabs
        defaultValue="private"
        styles={{
          tab: {
            fontSize: "var(--header-3)",
            fontWeight: "var(--bold)",
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="private">private</Tabs.Tab>
          <Tabs.Tab value="public">public</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="private">
          <Stack>
            <ScrollArea h={200}>
              <Flex direction={"column-reverse"}>
                {reverse([...messages.private]).map(
                  (message: Message, i: number) => (
                    <Flex key={i}>
                      <Text size="lg">{message.userName}:</Text>
                      <Text size="lg">{message.message}</Text>
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
              console.log("SUBMIT");
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
                {...form.getInputProps("message")}
                placeholder="Input"
                size="lg"
              ></TextInput>
              <Button
                color="var(--primary)"
                type="submit"
                styles={{
                  label: {
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--bold)",
                  },
                }}
              >
                Send
              </Button>
            </Flex>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="public">
          <Stack>
            <ScrollArea h={200}>
              <Flex direction={"column-reverse"}>
                {reverse([...messages.public]).map(
                  (message: Message, i: number) => (
                    <Flex key={i}>
                      <Text size="lg">{message.userName}:</Text>
                      <Text size="lg">{message.message}</Text>
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
              console.log("SEND", values, "SOCKET ", match.value.socket);
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
                {...form.getInputProps("message")}
                placeholder="Input"
                size="lg"
              ></TextInput>
              <Button
                color="var(--primary)"
                type="submit"
                styles={{
                  label: {
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--bold)",
                  },
                }}
              >
                Send
              </Button>
            </Flex>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default Chat;
