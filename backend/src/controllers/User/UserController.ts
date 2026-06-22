import { Response } from "express";
import { supabase } from "../../lib/supabase";
import { CreateUserDTO, EditDTO, LogInDTO } from "./validators/types";
import * as bcrypt from "bcrypt";
import {
  nameRegex,
  passwordRegex,
  userNameRegex,
} from "./validators/validators";
import { success } from "zod";
import { badRequest } from "../../utilities/utilities";
import { createAccessToken } from "../../lib/jwt";

export class UserController {
  public async post(data: CreateUserDTO, res: Response) {
    const { name, userName, password } = data;

    try {
      if (!nameRegex.test(name)) {
        badRequest(res, "name doesn't match format");
        return;
      }

      if (!userNameRegex.test(userName)) {
        badRequest(res, "Username doesn't match format");
        return;
      }

      if (!passwordRegex.test(password)) {
        badRequest(res, "Password must be at least 8 characters");
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: userData, error } = await supabase
        .from("User")
        .insert({
          name,
          user_name: userName,
          password: hashedPassword,
        })
        .select("id, name, user_name")
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({
            success: false,
            message: "Username already exists",
          });
        }

        console.error("[USER_CREATE] DB error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to create user",
        });
      }

      const token = createAccessToken(userData.id);

      return res.status(201).json({
        success: true,
        user: userData,
        token,
      });
    } catch (err) {
      console.error("[USER_CREATE] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async get(data: LogInDTO, res: Response) {
    const { userName, password } = data;

    try {
      if (!userNameRegex.test(userName)) {
        badRequest(res, "Username doesn't match format");
        return;
      }

      if (!passwordRegex.test(password)) {
        badRequest(res, "Password must be at least 8 characters");
        return;
      }

      const { data: userData, error } = await supabase
        .from("User")
        .select("id, name, user_name, password")
        .eq("user_name", userName)
        .single();

      if (error || !userData) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      console.log("compare", `[${password}] [${userData.password}]`);
      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = createAccessToken(userData.id);

      return res.status(200).json({
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
          userName: userData.user_name,
        },
        token,
      });
    } catch (err) {
      console.error("[USER_LOGIN] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async patch(data: EditDTO, res: Response) {
    const { name, userName, oldPassword, newPassword } = data;

    try {
      if (
        !nameRegex.test(name) ||
        !userNameRegex.test(userName) ||
        !passwordRegex.test(newPassword) ||
        !passwordRegex.test(oldPassword)
      )
        badRequest(
          res,
          "name, user name or password don't follow correct formatting",
        );

      const { data: userData, error } = await supabase
        .from("User")
        .select("name, user_name, password")
        .eq("user_name", userName)
        .single();

      if (error) {
        console.error("[USER_EDIT] DB error:", error);

        if (error.code === "23505") {
          return res.status(409).json({
            success: false,
            message: "Username already exists",
          });
        }

        return res.status(500).json({
          success: false,
          message: "wrong credentials",
        });
      }

      const hashedPassword = await bcrypt.hash(oldPassword, 10);
      console.log("HASH DB:", userData.password);
      console.log("HASH OLD:", hashedPassword);
      let isSamePassword = await bcrypt.compare(oldPassword, userData.password);
      if (!isSamePassword) {
        return res.status(500).json({
          success: false,
          message: "wrong credentials",
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const { data: updatedUserData, error: updatedUserDataError } =
        await supabase
          .from("User")
          .update({
            name: name,
            password: hashedNewPassword,
          })
          .select("name, user_name")
          .eq("user_name", userName)
          .single();

      if (updatedUserDataError) {
        return res.status(500).json({
          success: false,
          message: "failed to update",
        });
      }

      return res.status(201).json({
        success: true,
        user: updatedUserData,
      });
    } catch (err) {
      console.error("[USER_CREATE] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
