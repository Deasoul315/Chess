import { Button, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import React, { useState } from "react";
import { useUserDataContext } from "../contexts/UserData";
import { useCreateUser } from "../services/api/hooks/user/useCreateUser";
import {
  nameRegex,
  passwordRegex,
  userNameRegex,
} from "../constants/constants";

const UserSignUpForm = () => {
  const userData = useUserDataContext();
  const mutation = useCreateUser();

  const [error, setError] = useState<string>("");

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
          <Title order={4}>Creation Complete!</Title>
          <Text size="lg">Welcome {userData.value.name}</Text>
        </Stack>
      )}

      {!mutation.isSuccess && (
        <Stack>
          <form className="flex flex-col gap-3" onSubmit={submitUser}>
            <TextInput
              name="userName"
              label="Username"
              placeholder="username123"
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
            />

            <TextInput
              name="name"
              label="Name"
              placeholder="Mohammad"
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
            />

            <TextInput
              name="password"
              label="Password"
              placeholder="password"
              type="password"
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
            />

            <Group justify="flex-end">
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

          {error && <Text c="red">{error}</Text>}
        </Stack>
      )}
    </>
  );
};

export default UserSignUpForm;
