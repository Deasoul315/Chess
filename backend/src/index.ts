// app.ts
import express from "express";
import cors from "cors";
import { router } from "./routers/router";

import https from "node:https";
import cookieParser from "cookie-parser";
import { makeSocketServer } from "./lib/websocket";
import { PORT } from "./config";
import fs from "fs";
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://chess-silk-sigma.vercel.app",
      //  "https://localhost:3000"
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use(router);

const server = https.createServer(
  {
    key: fs.readFileSync("src/certificates/key.pem"),
    cert: fs.readFileSync("src/certificates/cert.pem"),
  },
  app,
);

// const server = http.createServer(app);

const wss = makeSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT}`);
});

export default app;
