import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import React, { useState } from "react";
import { useUserDataContext } from "../contexts/UserData";
import { useCreateUser } from "../services/api/hooks/user/useCreateUser";
import {
  nameRegex,
  passwordRegex,
  userNameRegex,
} from "../constants/constants";
import { useMediaQuery } from "@mantine/hooks";

const UserSignUpForm = () => {
  const userData = useUserDataContext();
  const mutation = useCreateUser();

  const [error, setError] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  async function submitUser(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name");
    const userName = formData.get("userName");
    const password = formData.get("password");

    if (typeof name !== "string") {
      setError("Name is required");
      return;
    }

    if (typeof userName !== "string") {
      setError("Username is required");
      return;
    }

    if (typeof password !== "string") {
      setError("Password is required");
      return;
    }

    if (!nameRegex.test(name)) {
      setError("name doesn't match format");
      return;
    }

    if (!userNameRegex.test(userName)) {
      setError("Username doesn't match format");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");

    try {
      await mutation.mutateAsync({
        name,
        userName,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      {mutation.isSuccess && (
        <Stack align="center">
          <Title order={5} hiddenFrom="md">
            Creation Complete!
          </Title>

          <Title order={4} visibleFrom="md">
            Creation Complete!
          </Title>

          <Text size="md" hiddenFrom="md">
            Welcome {userData.value.name}
          </Text>

          <Text size="lg" visibleFrom="md">
            Welcome {userData.value.name}
          </Text>
        </Stack>
      )}

      {!mutation.isSuccess && (
        <Stack>
          <form className="flex flex-col gap-3" onSubmit={submitUser}>
            <TextInput
              name="userName"
              label="Username"
              placeholder="username123"
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
              name="name"
              label="Name"
              placeholder="Mohammad"
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
              type="password"
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

            <Group justify="flex-end">
              <Button
                type="submit"
                color="var(--primary)"
                size="md"
                hiddenFrom="md"
              >
                submit
              </Button>

              <Button
                type="submit"
                color="var(--primary)"
                size={isMobile ? "md" : "lg"}
                visibleFrom="md"
              >
                submit
              </Button>
            </Group>
          </form>

          {error && <Text c="red">{error}</Text>}
        </Stack>
      )}
    </>
  );
};

export default UserSignUpForm;
