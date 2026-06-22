"use client";
import { useEffect, useRef, useState } from "react";
import { Piece } from "../constants/types";
import Image from "next/image";
import { Referee } from "../features/referee/referee";
import { useMatchContext } from "../contexts/Match";

export default function Board({
  chessBoard,
  update,
  team,
}: {
  chessBoard: (Piece | null)[][];
  update: (fromX: number, fromY: number, toX: number, toY: number) => void;
  team: "BLACK" | "WHITE";
}) {
  const match = useMatchContext();
  const [tileWidth, setTileWidth] = useState(0);
  const boardElementRef = useRef<null | HTMLDivElement>(null);
  const activePieceRef = useRef<null | HTMLElement>(null);
  const [location, setLocation] = useState<null | { x: number; y: number }>(
    null,
  );

  useEffect(() => {
    const updateTileWidth = () => {
      console.log("effect resize");
      const width = window.innerWidth;

      switch (true) {
        case width < 400:
          console.log("less than 300");
          setTileWidth(35);
          break;
        case width < 600:
          console.log("less than 600");
          setTileWidth(40);
          break;
        case width < 900:
          console.log("less than 900");
          setTileWidth(60);
          break;
        case width < 1300:
          setTileWidth(90);
          break;
        default:
          setTileWidth(100);
          break;
      }
    };

    updateTileWidth();

    window.addEventListener("resize", updateTileWidth);

    return () => {
      window.removeEventListener("resize", updateTileWidth);
    };
  }, []);

  function handleGrabPiece(e: React.MouseEvent<HTMLDivElement>) {
    if (match.value.winner) return;

    let element: HTMLElement = e.currentTarget;
    let boardElement = boardElementRef.current;

    if (boardElement) {
      let y = Math.floor((e.clientX - boardElement.offsetLeft) / tileWidth);
      let x = Math.floor((e.clientY - boardElement.offsetTop) / tileWidth);
      let piece = chessBoard[x][y];
      if (!piece || team !== piece.team) return;
      activePieceRef.current = element;
      setLocation({ x: x, y: y });

      element.style.position = "absolute";
      element.style.left = `${e.clientX - tileWidth / 2}px`;
      element.style.top = `${e.clientY - tileWidth / 2}px`;
    }
  }

  function handleMovePiece(e: React.MouseEvent<HTMLDivElement>) {
    if (activePieceRef.current) {
      let element: HTMLElement = activePieceRef.current;
      element.style.position = "absolute";
      let board: HTMLElement | null = boardElementRef.current;
      if (board) {
        let minX: number = board.offsetLeft;
        let minY: number = board.offsetTop;
        let maxX: number = board.clientWidth + board.offsetLeft;
        let maxY: number = board.clientHeight + board.offsetTop;

        if (e.clientX < minX) {
          element.style.left = `${minX - (tileWidth * 1) / 4}px`;
        } else if (e.clientX > maxX) {
          element.style.left = `${maxX - (tileWidth * 3) / 4}px`;
        } else {
          element.style.left = `${e.clientX - (tileWidth * 1) / 2}px`;
        }

        if (e.clientY < minY) {
          element.style.top = `${minY - (tileWidth * 1) / 4}px`;
        } else if (e.clientY > maxY) {
          element.style.top = `${maxY - (tileWidth * 3) / 4}px`;
        } else {
          element.style.top = `${e.clientY - (tileWidth * 1) / 2}px`;
        }
      }
    }
  }

  function handleDropPiece(e: React.MouseEvent<HTMLDivElement>) {
    console.log("out");
    if (!boardElementRef.current || !activePieceRef.current || !location)
      return;

    let element = e.target as HTMLElement;
    let board = boardElementRef.current;
    let referee = new Referee(chessBoard, match.value.isMoveBoard);
    let yCoord = Math.floor(
      (e.clientX - boardElementRef.current.offsetLeft) / tileWidth,
    );
    let xCoord = Math.floor(
      (e.clientY - boardElementRef.current.offsetTop) / tileWidth,
    );
    console.log(location.x, location.y, xCoord, yCoord);
    console.log(referee.canMove(location.x, location.y, xCoord, yCoord));
    if (location && referee.canMove(location.x, location.y, xCoord, yCoord)) {
      console.log("drop");
      update(location.x, location.y, xCoord, yCoord);
      activePieceRef.current.style.position = "relative";
      activePieceRef.current.style.left = "0px";
      activePieceRef.current.style.top = "0px";
      activePieceRef.current = null;
      setLocation(null);
      // if (ws && ws.readyState === WebSocket.OPEN) {
      //   ws.send(JSON.stringify(payload));
      // }
    } else {
      activePieceRef.current.style.position = "relative";
      activePieceRef.current.style.left = "0px";
      activePieceRef.current.style.top = "0px";
      activePieceRef.current = null;
      setLocation(null);
    }
  }

  let list: React.ReactElement[][] = [];
  let correctPlacements: null | ("INVALID" | "MOVE" | "ATTACK")[][] = null;
  console.log("is move board ,", match.value.isMoveBoard);
  let referee = new Referee(chessBoard, match.value.isMoveBoard);
  if (activePieceRef.current && location) {
    correctPlacements = referee.extractCorrectPlacements(
      location.x,
      location.y,
    );
    console.log("correct ", correctPlacements);
  }

  let whiteKing = referee.findKing("WHITE");
  let blackKing = referee.findKing("BLACK");
  // const isWhiteChecked = referee.isChecked("WHITE");
  // const isBlackChecked = referee.isChecked("BLACK");

  for (let i = 0; i < chessBoard.length; i++) {
    list.push([]);
    for (let j = 0; j < chessBoard[i].length; j++) {
      const piece = chessBoard[i][j];
      let squareColor: string;

      if (whiteKing.x === i && whiteKing.y === j && false) {
        squareColor = "bg-red-700";
      } else if (blackKing.x === i && blackKing.y === j && false) {
        squareColor = "bg-red-700";
      } else if (!correctPlacements) {
        squareColor = (i + j) % 2 ? "bg-(--primary)" : "bg-(--secondary)";
      } else {
        const placement = correctPlacements[i][j];

        if (placement === "INVALID") {
          squareColor = (i + j) % 2 ? "bg-(--primary)" : "bg-(--secondary)";
        } else if (placement === "ATTACK") {
          squareColor = "bg-red-400";
        } else {
          // MOVE
          squareColor = "bg-green-400";
        }
      }
      list[i].push(
        <div
          key={JSON.stringify(i) + JSON.stringify(j)}
          style={{
            width: tileWidth,
            height: tileWidth,
          }}
          className={squareColor}
        >
          {piece && (
            <div
              onPointerDown={handleGrabPiece}
              onPointerMove={handleMovePiece}
              onPointerUp={handleDropPiece}
            >
              <Image
                src={piece.image}
                width={tileWidth - 0.1 * tileWidth}
                height={tileWidth - 0.1 * tileWidth}
                alt=""
              ></Image>
            </div>
          )}
        </div>,
      );
    }
  }

  return (
    <>
      {
        <div
          className="grid grid-cols-8 grid-rows-8 w-fit"
          ref={boardElementRef}
        >
          {list}
        </div>
      }
    </>
  );
}
