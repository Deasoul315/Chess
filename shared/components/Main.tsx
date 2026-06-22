// "use client";

// import { chessXAxis, chessYAxis } from "@/shared/constants/constants";
// import { Piece } from "@/shared/constants/types";
// import { MatchContextProvider, useMatchContext } from "@/shared/contexts/Match";
// import Image from "next/image";
// import { useEffect, useRef, useState } from "react";
// import { Referee } from "../features/referee/referee";
// import {
//   ActionIcon,
//   AppShell,
//   Burger,
//   Button,
//   Modal,
//   useComputedColorScheme,
//   useMantineColorScheme,
// } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
// import { HeartIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
// import { Checkbox, Group, TextInput } from "@mantine/core";
// import { MatchApi, UserApi } from "../services/api/api";
// import { UserProps } from "../types/types";
// import SideBar from "./Shell/SideBar";

// export default function Main() {
//   const [correctPlacement, setCorrectPlacement] = useState<
//     Array<Array<string | null>>
//   >([...Array(8)].map(() => Array(8).fill(null)));

//   const [code, setCode] = useState("");
//   const [users, setUsers] = useState<any>([]);
//   const [user, setUser] = useState("");
//   const [isHost, setIsHost] = useState(false);

//   // useEffect(() => {
//   //   let matchApi = new MatchApi();
//   //   async function fetcher() {
//   //     let poll = await matchApi.getMatch(code);
//   //     if (poll[0] && poll[0].host && poll[0].guest) {
//   //       console.log("set users ", [poll[0].host, poll[0].guest]);
//   //       setUsers([poll[0].host, poll[0].guest]);
//   //     }
//   //     console.log("FETCH ", users);
//   //   }
//   //   const interval = setInterval(fetcher, 5000); // every 5 seconds

//   //   return () => clearInterval(interval);
//   // }, [code]);

//   // useEffect(() => {
//   //   // Use the native WebSocket in the browser
//   //   const websocket = new WebSocket("ws://localhost:8080");

//   //   setWs(websocket);
//   //   websocket.onopen = () => console.log("Connected to WebSocket server");
//   //   websocket.onmessage = (event: MessageEvent) => {};
//   //   websocket.onclose = () => console.log("Disconnected from WebSocket server");
//   //   websocket.onerror = (err) => console.error("WebSocket error:", err);
//   // }, []);

//   //   // Cleanup on unmount
//   //   return () => websocket.close();
//   // }, []);
//   const match = useMatchContext();

//   // function handleLoginSubmission(data: any) {
//   //   const username = data.get("username");
//   //   let payload = { type: "create_user", username: username };
//   //   if (ws && ws.readyState === WebSocket.OPEN) {
//   //     ws.send(JSON.stringify(payload));
//   //   }
//   // }

//   function handleGameStartSubmission(e: any) {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       setIsHost(true);
//       ws.send(
//         JSON.stringify({
//           type: "START",
//           guestName: users[1],
//           hostName: user,
//         }),
//       );
//     }
//   }
//   async function handleCreateRoomSubmission(
//     e: React.MouseEvent<HTMLButtonElement>,
//   ) {
//     let element = e.currentTarget;
//     let payload = { username: "Dea" };
//     let matchApi = new MatchApi();
//     let code = await matchApi.createMatch(payload);
//     setCode(code);
//     console.log("post match ", code);
//     // if (ws && ws.readyState === WebSocket.OPEN) {
//     //   ws.send(JSON.stringify(payload));
//     // }
//   }

//   async function handleJoinRoomSubmission(data: any) {
//     const roomCode = data.get("code");
//     const userName = data.get("userName");
//     let payload = { type: "JOIN", roomId: roomCode, username: userName };
//     let matchApi = new MatchApi();
//     let res = await matchApi.joinMatch({
//       matchCode: roomCode,
//       guestName: userName,
//     });
//     if (res) {
//       setCode(roomCode);
//     }
//   }

//   return (
//     /* <main className="" onClick={toggle}>
//           <div className="flex justify-center content-center">
//             <div className="">
//               <Board
//                 chessBoard={match.value.board}
//                 update={(fromX, fromY, toX, toY) => {
//                   match.dispatch({
//                     type: "PLACE_PIECE",
//                     params: { fromX: fromX, fromY: fromY, toX: toX, toY: toY },
//                   });
//                   if (ws && ws.readyState === WebSocket.OPEN) {
//                     ws.send(
//                       JSON.stringify({
//                         type: "PLAY",
//                         userName: user,
//                         fromX: fromX,
//                         fromY: fromY,
//                         toX: toX,
//                         toY: toY,
//                       }),
//                     );
//                   }
//                 }}
//                 team={isHost ? "WHITE" : "BLACK"}
//               ></Board>
//             </div>
//           </div>
//           <form
//             onSubmit={(e: any) => {
//               e.preventDefault();
//               setUser(new FormData(e.currentTarget).get("username") as string);
//             }}
//             className="flex gap-2 content-center items-center m-1"
//           >
//             <label className="font-bold">Username</label>
//             <input
//               name="username"
//               className="focus:outline-none h-6 border-2  rounded-xs bg-white border-white text-black"
//             />
//             <button
//               type="submit"
//               className="hover:cursor-pointer font-bold bg-black w-[100px] h-[30px] transition ease-in-out duration-300 hover:bg-[#876100] border-2 rounded-2xl border-black hover:border-[#876100]"
//             >
//               Log In
//             </button>
//           </form>
//           <div className="flex gap-2 content-center items-center m-1">
//             <button
//               onMouseDown={(e) => handleCreateRoomSubmission(e)}
//               className="hover:cursor-pointer font-bold bg-black w-[200px] h-[30px] transition ease-in-out duration-300 hover:bg-[#876100] border-2 rounded-2xl border-black hover:border-[#876100]"
//             >
//               Create Room
//             </button>
//             <button
//               onMouseDown={(e) => handleGameStartSubmission(e)}
//               className="hover:cursor-pointer font-bold bg-black w-[200px] h-[30px] transition ease-in-out duration-300 hover:bg-[#876100] border-2 rounded-2xl border-black hover:border-[#876100]"
//             >
//               Start Game
//             </button>
//             <div className="font-bold">{match.value.code}</div>
//           </div>
//           <form
//             action={handleJoinRoomSubmission}
//             className="flex gap-2 content-center items-center m-1"
//           >
//             <label className="font-bold">Join at </label>
//             <input
//               name="userName"
//               className="focus:outline-none h-6 border-2  rounded-xs bg-white border-white text-black"
//             />
//             <input
//               name="code"
//               className="focus:outline-none h-6 border-2  rounded-xs bg-white border-white text-black"
//             />
//             <button
//               type="submit"
//               className="hover:cursor-pointer font-bold bg-black w-[100px] h-[30px] transition ease-in-out duration-300 hover:bg-[#876100] border-2 rounded-2xl border-black hover:border-[#876100]"
//             >
//               Join
//             </button>
//           </form>
//           <div className=" h-100 w-100 bg-amber-300 text-black">
//             <div>logged in : {user}</div>
//             <div>{code}</div>
//             {users.map((e: any, index: any) => (
//               <div key={index}>{e}</div>
//             ))}
//           </div>
//         </main> */
//     <></>
//   );
// }
