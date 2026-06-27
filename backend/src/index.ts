// console.log(await supabase.from("Users").select("*"));

// app.ts
import express from "express";
import cors from "cors";
import { router } from "./routers/router";
import { PORT } from "./config/config";
import http from "node:http";
import { makeSocketServer } from "./lib/websocket";
const app = express();

app.use(
  cors({
    origin: ["https://chess-silk-sigma.vercel.app", "http://localhost:3000"],
  }),
);
app.use(express.json());

app.use(router);

// create HTTP server manually
const server = http.createServer(app);

// attach websocket to the same server

const wss = makeSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on ${PORT}`);
});

export default app;

// class User {
//   constructor(id, socket) {
//     this.username = "unknown";
//     this.id = id;
//     this.socket = socket;
//   }
// }

// class Room {
//   constructor(roomId) {
//     this.user1 = null;
//     this.user2 = null;
//     this.roomId = roomId;
//     this.turn = 0;
//   }
// }

// let id = 0;
// let users = [];
// let rooms = [];

// function makeCode(length) {
//   let result = "";
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   for (let i = 0; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return result;
// }

// wss.on("connection", (socket) => {
//   console.log("Client connected");

//   let user = new User(id++, socket);
//   users.push(user);

//   socket.on("message", (message) => {
//     const data = JSON.parse(message);
//     console.log("Got message: ")
//     console.log(data)

//     switch (data.type) {
//       // -------------------------------------------
//       // CREATE ROOM
//       // -------------------------------------------
//       case "create_room": {
//         let roomId = makeCode(8);
//         let room = new Room(roomId);
//         room.user1 = user.id;

//         rooms.push(room);

//         socket.send(JSON.stringify({
//           type:"create_room",
//           roomId: room.roomId,
//         }));
//         break;
//       }

//       // -------------------------------------------
//       // SET USERNAME
//       // -------------------------------------------
//       case "create_user": {
//         user.username = data.username;
//         console.log("created")
//         socket.send(JSON.stringify({
//           type: "create_user",
//           username:user.username
//         }))
//         break;
//       }

//       // -------------------------------------------
//       // JOIN ROOM
//       // -------------------------------------------
//       case "join_room": {
//         let room = rooms.find((r) => r.roomId === data.roomId);

//         if (room) {
//           let cur = users.find((u) => u.id === user.id);

//           if (cur) {
//             room.user2 = cur.id;

//             let user1 = users.find((u) => u.id === room.user1);

//             if (user1 && cur) {
//               // Notify both users
//               user1.socket.send(
//                 JSON.stringify({
//                   type: "join_room",
//                   users: [
//                     {
//                       username:user1.username,
//                       team:"WHITE"
//                     },
//                     {
//                       username:cur.username,
//                       team:"BLACK"
//                     }
//                   ],
//                   startingTeam:"WHITE"
//                 })
//               );
//               cur.socket.send(
//                 JSON.stringify({
//                   type: "join_room",
//                   users: [
//                     {
//                       username:user1.username,
//                       team:"WHITE"
//                     },
//                     {
//                       username:cur.username,
//                       team:"BLACK"
//                     }
//                   ],
//                   startingTeam:"WHITE"
//                 })
//               );

//             }
//           }
//         }
//         break;
//       }

//       // -------------------------------------------
//       // PLAY LOGIC
//       // -------------------------------------------

//       case "play": {
//         console.log("\n================ PLAY RECEIVED ================");
//         console.log("From user:", user.id, user.username);
//         console.log("Move:", data.fromX, data.fromY, "→", data.toX, data.toY);

//         let room = rooms.find(
//           (r) => r.user1 === user.id || r.user2 === user.id
//         );

//         if (!room) {
//           console.log(" No room found for this user!");
//           break;
//         }

//         console.log("Room:", room.roomId, "| Turn:", room.turn);
//         console.log("Players:", room.user1, room.user2);

//         let u1 = users.find((u) => u.id === room.user1);
//         let u2 = users.find((u) => u.id === room.user2);

//         if (!u1 || !u2) {
//           console.log("Missing player in room.");
//           break;
//         }

//         console.log("User1:", u1.id, u1.username);
//         console.log("User2:", u2.id, u2.username);

//         // --------------------------------------------
//         // PLAY LOGIC
//         // --------------------------------------------
//         console.log("room data")
//         console.log(room)

//         console.log("Current player is USER1");

//         if (room.turn === 0 && u1.id === user.id) {
//           console.log("Turn was 0 → switching to 1 (User2)");

//           room.turn = 1;

//           console.log("Sending move to User2:", u2.username);

//           u2.socket.send(JSON.stringify({
//             type: "play",
//             fromX: data.fromX,
//             fromY: data.fromY,
//             toX: data.toX,
//             toY: data.toY
//           }));

//         } else if (room.turn === 1 && u2.id === user.id) {
//           console.log("Turn was 1 → switching to 0 (User1)");
//           room.turn = 0;

//           console.log("Sending move to User1:", u1.username);

//           u1.socket.send(JSON.stringify({
//             type: "play",
//             fromX: data.fromX,
//             fromY: data.fromY,
//             toX: data.toX,
//             toY: data.toY
//           }));
//         } else {
//           console.log("wrong play");
//         }

//         console.log("Next turn:", room.turn);
//         console.log("==============================================\n");

//         break;
//       }

//       // -------------------------------------------
//       case "error":
//         console.error("Server error:", data.message);
//         break;

//       default:
//         console.log("Unknown message:", data);
//     }
//   });

//   socket.on("close", () => {
//     console.log("Client disconnected");
//   });
// });
