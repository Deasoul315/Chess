import {
  Button,
  FocusTrap,
  Group,
  Loader,
  LoadingOverlay,
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
import { useMediaQuery } from "@mantine/hooks";

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
    userData.set({
      userName: credentials.userName,
      name: query.data.name,
      accessToken: query.data.accessToken,
    });
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
      setError(
        "Invalid username format, the allowed characters are alphabet, underscore and numbers",
      );
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

  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Stack>
      {query.isSuccess && (
        <Stack align="center">
          <Title order={5} hiddenFrom="md">
            Sign in Complete!
          </Title>

          <Title order={4} visibleFrom="md">
            Sign in Complete!
          </Title>

          <Text fz={{ base: "md", md: "lg" }}>
            Welcome {userData.value.name}
          </Text>
        </Stack>
      )}

      {!query.isSuccess && (
        <Stack>
          <form className="flex flex-col gap-3" onSubmit={(e) => submitUser(e)}>
            <Stack pos={"relative"}>
              <TextInput
                name="userName"
                label="Username"
                placeholder="username123"
                autoFocus
                size={isMobile ? "md" : "lg"}
                styles={{
                  label: {
                    fontWeight: "var(--bold)",
                  },
                  input: {
                    fontWeight: "var(--bold)",
                  },
                }}
              />

              <TextInput
                name="password"
                label="Password"
                placeholder="password"
                size={isMobile ? "md" : "lg"}
              />
            </Stack>

            <Group flex={"flex"} justify="flex-end">
              <Button
                type="submit"
                color="var(--primary)"
                size={isMobile ? "md" : "lg"}
              >
                {query.isFetching ? <Loader /> : "Submit"}
              </Button>
            </Group>
          </form>

          {error && <Text c={"red"}>{error}</Text>}
          {query.isError && <Text c={"red"}>{query.error.message}</Text>}
        </Stack>
      )}
    </Stack>
  );
};

export default UserSignInForm;
