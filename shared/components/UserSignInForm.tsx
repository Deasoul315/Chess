import {
  Button,
  FocusTrap,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useUserDataContext } from "../contexts/UserData";
import { useCreateUser } from "../services/api/hooks/user/useCreateUser";
import { useGetUser } from "../services/api/hooks/user/useGetUser";
import { passwordRegex, userNameRegex } from "../constants/constants";

const UserSignInForm = () => {
  const userData = useUserDataContext();
  const [error, setError] = useState<null | string>(null);

  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });

  const query = useGetUser(credentials);

  useEffect(() => {
    if (!query.data) return;
    userData.set({ userName: credentials.userName, name: query.data.name });
  }, [query.isSuccess]);

  async function submitUser(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let userName = formData.get("userName");
    let password = formData.get("password");

    if (typeof userName !== "string") {
      setError("Username must be a string");
      return;
    }

    if (typeof password !== "string") {
      setError("Password must be a string");
      return;
    }

    if (!userNameRegex.test(userName)) {
      setError("Invalid username format");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Invalid password format, it must be 8 characters at least contain digit special caps and small letters",
      );
      return;
    }
    setError(null);
    setCredentials({ userName, password });
  }

  return (
    <>
      {query.isSuccess && (
        <Stack align="center">
          <Title order={4}>Sign in Complete!</Title>
          <Text>Welcome {userData.value.name}</Text>
        </Stack>
      )}
      {!query.isSuccess && (
        <Stack>
          <form className="flex flex-col gap-3" onSubmit={(e) => submitUser(e)}>
            <TextInput
              name="userName"
              label="Username"
              placeholder="username123"
              autoFocus
              styles={{
                label: {
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--bold)",
                },
              }}
            ></TextInput>
            <TextInput
              styles={{
                label: {
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--bold)",
                },
              }}
              name="password"
              label="Password"
              placeholder="password"
            ></TextInput>

            <Group flex={"flex"} justify="flex-end">
              <Button
                type="submit"
                color="var(--primary)"
                styles={{
                  label: {
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--bold)",
                  },
                }}
              >
                submit
              </Button>
            </Group>
          </form>
          {error && <Text c={"red"}>{error}</Text>}
          {query.isError && <Text c={"red"}>{query.error.message}</Text>}
        </Stack>
      )}
    </>
  );
};

export default UserSignInForm;
