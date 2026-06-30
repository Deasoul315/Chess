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
import { badRequest, ok, serverError } from "../../utilities/utilities";
import { createAccessToken, createRefreshToken } from "../../lib/jwt";
import { connections } from "../../store/global";
import { UserService } from "../../services/UserService";
import { logger } from "../../lib/logger";
import { cookieConfig } from "../../config";

export class UserController {
  public async getData(userId: number, res: Response) {
    try {
      logger.info("[GET_USER_DATA]");

      const userService = new UserService();
      const { data: userData, error } = await userService.findById(userId);

      if (error || !userData) {
        return badRequest(res, "user not found");
      }

      return ok(res, {
        success: true,
        user: {
          name: userData.name,
          userName: userData.user_name,
        },
      });
    } catch (err) {
      console.error("[USER_LOGIN] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async post(data: CreateUserDTO, res: Response) {
    try {
      const { name, userName, password } = data;

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
      const userService = new UserService();
      const { data: userData, error } = await userService.create(
        name,
        userName,
        hashedPassword,
      );

      if (error && error.code === "23505") {
        console.error("[USER_CREATE] DB error:", error);

        return badRequest(res, "user already exists");
      }

      if (error) {
        console.error("[USER_CREATE] DB error:", error);

        return serverError(res, "couldn't create user");
      }

      const token = createAccessToken(userData.id);
      const refreshToken = createRefreshToken(userData.id);

      res.cookie("refreshToken", refreshToken, cookieConfig);

      return ok(res, {
        success: true,
        user: {
          name: userData.name,
          userName: userData.user_name,
        },
        accessToken: token,
      });
    } catch (err) {
      console.error("[USER_CREATE] Unexpected error:", err);

      return serverError(res, "couldn't sign up");
    }
  }

  public async get(data: LogInDTO, res: Response) {
    try {
      logger.info("[SIGN_IN]", data);
      const { userName, password } = data;

      if (!userNameRegex.test(userName)) {
        badRequest(res, "Username doesn't match format");
        return;
      }
      if (!passwordRegex.test(password)) {
        badRequest(res, "Password must be at least 8 characters");
        return;
      }

      const userService = new UserService();
      const { data: userData, error } =
        await userService.findByUserName(userName);

      if (error || !userData) {
        return badRequest(res, "user not found");
      }

      const isPasswordValid = await bcrypt.compare(password, userData.password);

      if (!isPasswordValid) {
        return badRequest(res, "invalid credentials");
      }

      const token = createAccessToken(userData.id);
      const refreshToken = createRefreshToken(userData.id);
      console.log("TOKEN", refreshToken);
      res.cookie("refreshToken", refreshToken, cookieConfig);

      return ok(res, {
        success: true,
        user: {
          name: userData.name,
          userName: userData.user_name,
        },
        accessToken: token,
      });
    } catch (err) {
      console.error("[USER_LOGIN] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async signOut(res: Response) {
    try {
      logger.info("[SIGN_OUT]");

      res.clearCookie("refreshToken", cookieConfig);

      return ok(res, {
        success: true,
      });
    } catch (err) {
      console.error("[USER_LOGIN] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async patch(userId: number, data: EditDTO, res: Response) {
    try {
      const { name, oldPassword, newPassword } = data;

      if (
        !nameRegex.test(name) ||
        !passwordRegex.test(newPassword) ||
        !passwordRegex.test(oldPassword)
      )
        badRequest(
          res,
          "name, user name or password don't follow correct formatting",
        );

      const userService = new UserService();
      const { data: userData, error } = await userService.findById(userId);

      if (error) {
        console.error("[USER_EDIT] DB error:", error);

        return serverError(res, "server error");
      }

      const hashedPassword = await bcrypt.hash(oldPassword, 10);
      let isSamePassword = await bcrypt.compare(oldPassword, userData.password);

      if (!isSamePassword) {
        return badRequest(res, "not same password");
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const { data: updatedUserData, error: updatedUserDataError } =
        await userService.update(userData.user_name, {
          name: name,
          password: hashedNewPassword,
        });

      if (updatedUserDataError) {
        return serverError(res, "couldn't update ");
      }

      return ok(res, {
        success: true,
        user: updatedUserData,
      });
    } catch (err) {
      console.error("[USER_CREATE] Unexpected error:", err);

      return serverError(res, "couldn't update");
    }
  }
}
