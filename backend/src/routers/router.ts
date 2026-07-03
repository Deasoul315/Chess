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
import { badRequest, ok, unauthorized, validate } from "../utilities/utilities";
import { authenticate, refreshAccessToken } from "../lib/jwt";

const router = Router();

const userController = new UserController();
const matchController = new MatchController();
const scoreController = new ScoreController();

//
// USER ROUTES
//

router.post("/user/refresh", (req, res) => {
  const accessToken = refreshAccessToken(req);

  if (!accessToken)
    return badRequest(res, "couldnt make new token with provided token");

  return ok(res, { success: true, accessToken });
});

router.get("/user", (req, res) => {
  const userId = authenticate(req);
  if (!userId) return unauthorized(res, "unauthorized");

  return userController.getData(userId, res);
});

router.patch("/user/signout", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  return userController.signOut(res);
});

router.post("/user/signup", (req, res) => {
  const data = validate(createUserSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return userController.post(data, res);
});

router.post("/user/login", (req, res) => {
  const data = validate(logInSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return userController.get(data, res);
});

router.patch("/user/edit", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(editSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return userController.patch(userId, data, res);
});

//
// SCORE ROUTES
//

router.get("/history", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(historySchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return scoreController.getHistory(userId, data, res);
});

router.get("/score", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(scoreSchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return scoreController.getScore(userId, data, res);
});

router.get("/daily-stats", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(scoreSchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return scoreController.getDailyStats(userId, data, res);
});

router.get("/leaderboard", (req, res) => {
  const data = validate(leaderboardSchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return scoreController.getLeaderboard(data, res);
});

//
// MATCH ROUTES
//

router.post("/match", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(makeRoomSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return matchController.makeRoom(userId, data, res);
});

router.post("/match/config", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(configRoomSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return matchController.configRoom(userId, data, res);
});

router.get("/match/random", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(randomRoomSchema, req.params);

  if (!data) return badRequest(res, "invalid data");

  return matchController.randomRoom(userId, data, res);
});

router.get("/match/spectate", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(spectateRoomSchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return matchController.spectate(userId, data, res);
});

router.get("/match/active", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(activeRoomsSchema, req.params);

  if (!data) return badRequest(res, "invalid data");

  return matchController.getActiveRooms(data, res);
});

router.get("/match/reconnect", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(getRoomByIdParamsSchema, req.query);

  if (!data) return badRequest(res, "invalid data");

  return matchController.getRoomByUsername(userId, data, res);
});

router.get("/match/:code", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(getRoomParamsSchema, req.params);

  if (!data) return badRequest(res, "invalid data");

  return matchController.getRoom(userId, data, res);
});

router.patch("/match", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(joinRoomSchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return matchController.joinRoom(userId, data, res);
});

router.patch("/match/ready", (req, res) => {
  const userId = authenticate(req);

  if (!userId) return unauthorized(res, "unauthorized");

  const data = validate(makeReadySchema, req.body);

  if (!data) return badRequest(res, "invalid data");

  return matchController.makeReady(userId, data, res);
});

export default router;
export { router };
