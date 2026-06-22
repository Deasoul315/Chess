"use client";
import { nameRegex, passwordRegex } from "@/shared/constants/constants";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useEditUser } from "@/shared/services/api/hooks/user/useEditUser";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Notification,
  CheckIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";

export default function Account() {
  const userData = useUserDataContext();
  const mutation = useEditUser();
  const checkIcon = <CheckIcon size={20} />;
  const [opened, setOpened] = useState(true);

  const form = useForm({
    initialValues: {
      username: "",
      name: "",
      oldPassword: "",
      newPassword: "",
    },
    validate: {
      name: (value: string) =>
        !nameRegex.test(value) ? "name should be in a - z format" : null,
      oldPassword: (value: string) =>
        !passwordRegex.test(value)
          ? "password must be at least 8 characters with at least number / alpha / capped alpha"
          : null,
      newPassword: (value: string) =>
        !passwordRegex.test(value)
          ? "password must be at least 8 characters with at least number / alpha / capped alpha"
          : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const { name, oldPassword, newPassword } = values;
    mutation.mutate({
      userName: userData.value.userName,
      newPassword: newPassword,
      oldPassword: oldPassword,
      name: name,
    });
    // Call your API here
    // updateProfile(values)
  };

  return (
    <Container py="xl">
      <Paper shadow="sm" p="lg">
        <Title order={1} mb="lg">
          Edit Profile
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Username"
              value={userData.value.userName}
              readOnly
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
              label="Name"
              placeholder="Enter your name"
              {...form.getInputProps("name")}
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
            <PasswordInput
              label="Old Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("oldPassword")}
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
            <PasswordInput
              label="New Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("newPassword")}
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

            <Button
              color="primary"
              type="submit"
              mt="sm"
              styles={{
                label: {
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--bold)",
                },
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Paper>
      {mutation.isSuccess && opened && (
        <Notification
          icon={checkIcon}
          title="Noteification"
          c={"green"}
          onClick={() => setOpened(!opened)}
          styles={{
            body: {
              fontSize: "var(--text-lg)",
              fontWeight: "var(--bold)",
            },
            title: {
              fontSize: "var(--text-lg)",
              fontWeight: "var(--bold)",
            },
            icon: {
              background: "green",
            },
          }}
        >
          Changed Successfully!
        </Notification>
      )}
    </Container>
  );
}
