// routes/user.routes.ts
import { Router } from "express";
import { MatchController } from "../controllers/Match/MatchController";
import { UserController } from "../controllers/User/UserController";
import {
  createUserSchema,
  editSchema,
  logInSchema,
} from "../controllers/User/validators/validators";
import {
  activeRoomsSchema,
  configRoomSchema,
  getRoomByIdParamsSchema,
  getRoomParamsSchema,
  joinRoomSchema,
  makeReadySchema,
  makeRoomSchema,
  randomRoomSchema,
  spectateRoomSchema,
} from "../controllers/Match/validators/validators";
import {
  historySchema,
  leaderboardSchema,
  scoreSchema,
} from "../controllers/Score/validators/validators";
import { ScoreController } from "../controllers/Score/ScoreController";
import { Database } from "../types/supabase";

const router = Router();

const userController = new UserController();
const matchController = new MatchController();
const scoreController = new ScoreController();

//
// =======================
// USER ROUTES
// =======================
//

router.post("/user/signup", (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return userController.post(result.data, res);
});

router.post("/user/login", (req, res) => {
  const result = logInSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return userController.get(result.data, res);
});

router.patch("/user/edit", (req, res) => {
  const result = editSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return userController.patch(result.data, res);
});
router.get("/history", (req, res) => {
  const result = historySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return scoreController.getHistory(result.data, res);
});

router.get("/score", (req, res) => {
  console.log("SCORE");
  const result = scoreSchema.safeParse(req.query);
  console.log(req.query);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return scoreController.getScore(result.data, res);
});

router.get("/daily-stats", (req, res) => {
  console.log("DSCORE");
  const result = scoreSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return scoreController.getDailyStats(result.data, res);
});

router.get("/leaderboard", (req, res) => {
  console.log("LSCORE");
  const result = leaderboardSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return scoreController.getLeaderboard(result.data, res);
});
//
// =======================
// MATCH ROUTES
// =======================
//

router.post("/match", (req, res) => {
  const result = makeRoomSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return matchController.makeRoom(result.data, res);
});

router.post("/match/config", (req, res) => {
  const result = configRoomSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return matchController.configRoom(result.data, res);
});

router.get("/match/random/:userName", (req, res) => {
  const result = randomRoomSchema.safeParse(req.params);
  console.log("RANDOM ROOM");
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid params",
      errors: result.error.flatten(),
    });
  }

  return matchController.randomRoom(result.data, res);
});

router.get("/match/spectate", (req, res) => {
  console.log("got query ", req.query);
  const result = spectateRoomSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid params",
      errors: result.error.flatten(),
    });
  }

  return matchController.spectate(result.data, res);
});
router.get("/match/active", (req, res) => {
  const result = activeRoomsSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid params",
      errors: result.error.flatten(),
    });
  }

  return matchController.getActiveRooms(result.data, res);
});
router.get("/match/reconnect", (req, res) => {
  const result = getRoomByIdParamsSchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid params",
      errors: result.error.flatten(),
    });
  }

  return matchController.getRoomByUsername(result.data, res);
});
router.get("/match/:code", (req, res) => {
  const result = getRoomParamsSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid params",
      errors: result.error.flatten(),
    });
  }

  return matchController.getRoom(result.data, res);
});
router.patch("/match", (req, res) => {
  const result = joinRoomSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return matchController.joinRoom(result.data, res);
});

router.patch("/match/ready", (req, res) => {
  const result = makeReadySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.flatten(),
    });
  }

  return matchController.makeReady(result.data, res);
});

export default router;

export { router };
