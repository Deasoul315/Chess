// console.log(await supabase.from("Users").select("*"));

// app.ts
import express from "express";
import cors from "cors";
import { router } from "./routers/router";

import http from "node:http";
import cookieParser from "cookie-parser";
import { makeSocketServer } from "./lib/websocket";
import { PORT } from "./config";
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ["https://chess-silk-sigma.vercel.app", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

app.use(router);

const server = http.createServer(app);

const wss = makeSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT}`);
});

export default app;
