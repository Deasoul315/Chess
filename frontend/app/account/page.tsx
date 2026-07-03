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
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function Account() {
  const router = useRouter();
  const user = useUserDataContext();

  useEffect(() => {
    if (user.value.userName === "") {
      router.replace("/Home");
    }
  }, [user, router]);

  if (user.value.userName === "") {
    return null;
  }

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
      accessToken: userData.value.accessToken,
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
        <Title order={1} mb="lg" fz={{ base: "h3", md: "h1" }}>
          Edit Profile
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Username"
              value={userData.value.userName}
              readOnly
              size="md"
              hiddenFrom="md"
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
              label="Username"
              value={userData.value.userName}
              readOnly
              size="lg"
              visibleFrom="md"
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
              label="Name"
              placeholder="Enter your name"
              {...form.getInputProps("name")}
              size="md"
              hiddenFrom="md"
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
              label="Name"
              placeholder="Enter your name"
              {...form.getInputProps("name")}
              size="lg"
              visibleFrom="md"
              styles={{
                label: {
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontWeight: "var(--bold)",
                },
              }}
            />

            <PasswordInput
              label="Old Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("oldPassword")}
              size="md"
              hiddenFrom="md"
              styles={{
                label: {
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontWeight: "var(--bold)",
                },
              }}
            />

            <PasswordInput
              label="Old Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("oldPassword")}
              size="lg"
              visibleFrom="md"
              styles={{
                label: {
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontWeight: "var(--bold)",
                },
              }}
            />

            <PasswordInput
              label="New Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("newPassword")}
              size="md"
              hiddenFrom="md"
              styles={{
                label: {
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontWeight: "var(--bold)",
                },
              }}
            />

            <PasswordInput
              label="New Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps("newPassword")}
              size="lg"
              visibleFrom="md"
              styles={{
                label: {
                  fontWeight: "var(--bold)",
                },
                input: {
                  fontWeight: "var(--bold)",
                },
              }}
            />

            <Button
              color="primary"
              type="submit"
              mt="sm"
              size="lg"
              visibleFrom="md"
            >
              {mutation.isPending ? <Loader /> : "Save Changes"}
            </Button>
            <Button
              color="primary"
              type="submit"
              mt="sm"
              size="md"
              hiddenFrom="md"
            >
              {mutation.isPending ? <Loader /> : "Save Changes"}
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
