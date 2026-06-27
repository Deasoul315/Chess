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
      const width = window.innerWidth;

      switch (true) {
        case width < 400:
          setTileWidth(30);
          break;
        case width < 600:
          setTileWidth(40);
          break;
        case width < 900:
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
      let y = Math.floor(
        (e.clientX - boardElement.getBoundingClientRect().left) / tileWidth,
      );
      let x = Math.floor(
        (e.clientY - boardElement.getBoundingClientRect().top) / tileWidth,
      );
      if (team === "BLACK") x = 7 - x;

      let piece = chessBoard[x][y];
      if (!piece || team !== piece.team) return;
      activePieceRef.current = element;
      setLocation({ x: x, y: y });

      element.style.position = "absolute";
      element.style.left = `${e.clientX - boardElement.getBoundingClientRect().left - tileWidth / 2}px`;
      element.style.top = `${e.clientY - boardElement.getBoundingClientRect().top - tileWidth / 2}px`;
    }
  }

  function handleMovePiece(e: React.MouseEvent<HTMLDivElement>) {
    if (activePieceRef.current) {
      let element: HTMLElement = activePieceRef.current;
      element.style.position = "absolute";
      let board: HTMLElement | null = boardElementRef.current;
      if (board) {
        let minX: number = board.getBoundingClientRect().left;
        let minY: number = board.getBoundingClientRect().top;
        let maxX: number =
          board.clientWidth + board.getBoundingClientRect().left;
        let maxY: number =
          board.clientHeight + board.getBoundingClientRect().top;

        if (e.clientX < minX) {
          element.style.left = `${minX - board.getBoundingClientRect().left - (tileWidth * 1) / 4}px`;
        } else if (e.clientX > maxX) {
          element.style.left = `${maxX - board.getBoundingClientRect().left - (tileWidth * 3) / 4}px`;
        } else {
          element.style.left = `${e.clientX - board.getBoundingClientRect().left - (tileWidth * 1) / 2}px`;
        }

        if (e.clientY < minY) {
          element.style.top = `${minY - board.getBoundingClientRect().top - (tileWidth * 1) / 4}px`;
        } else if (e.clientY > maxY) {
          element.style.top = `${maxY - board.getBoundingClientRect().top - (tileWidth * 3) / 4}px`;
        } else {
          element.style.top = `${e.clientY - board.getBoundingClientRect().top - (tileWidth * 1) / 2}px`;
        }
      }
    }
  }

  function handleDropPiece(e: React.MouseEvent<HTMLDivElement>) {
    if (!boardElementRef.current || !activePieceRef.current || !location)
      return;

    let element = e.target as HTMLElement;
    let board = boardElementRef.current;
    let referee = new Referee();
    let yCoord = Math.floor(
      (e.clientX - boardElementRef.current.getBoundingClientRect().left) /
        tileWidth,
    );
    let xCoord = Math.floor(
      (e.clientY - boardElementRef.current.getBoundingClientRect().top) /
        tileWidth,
    );
    if (team === "BLACK") xCoord = 7 - xCoord;
    if (
      location &&
      referee.canMove(
        location.x,
        location.y,
        xCoord,
        yCoord,
        match.value.board,
        match.value.isMoveBoard,
      )
    ) {
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
  let referee = new Referee();
  if (activePieceRef.current && location) {
    correctPlacements = referee.extractCorrectPlacements(
      location.x,
      location.y,
      chessBoard,
      match.value.isMoveBoard,
    );
  }

  let whiteKing = referee.findKing("WHITE", chessBoard);
  let blackKing = referee.findKing("BLACK", chessBoard);
  const isWhiteChecked = referee.isChecked("WHITE", chessBoard);
  const isBlackChecked = referee.isChecked("BLACK", chessBoard);
  const lastMove = match.value.lastMove;

  for (let i = 0; i < chessBoard.length; i++) {
    list.push([]);
    for (let j = 0; j < chessBoard[i].length; j++) {
      const piece = chessBoard[i][j];
      let squareColor: string = "";

      if (whiteKing.x === i && whiteKing.y === j && isWhiteChecked) {
        squareColor = "bg-red-700";
      } else if (blackKing.x === i && blackKing.y === j && isBlackChecked) {
        squareColor = "bg-red-700";
      } else if (!correctPlacements) {
        if (
          lastMove &&
          ((lastMove.fromX === i && lastMove.fromY === j) ||
            (lastMove?.toX === i && lastMove.toY === j))
        ) {
          squareColor = "bg-blue-400";
        } else {
          squareColor = (i + j) % 2 ? "bg-(--primary)" : "bg-(--secondary)";
        }
      } else {
        const placement = correctPlacements[i][j];

        if (placement === "INVALID") {
          if (
            lastMove &&
            ((lastMove.fromX === i && lastMove.fromY === j) ||
              (lastMove?.toX === i && lastMove.toY === j))
          ) {
            squareColor = "bg-blue-400";
          } else
            squareColor = (i + j) % 2 ? "bg-(--primary)" : "bg-(--secondary)";
        } else if (placement === "ATTACK") {
          squareColor = "bg-red-400";
        } else if (placement === "MOVE") {
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
          className={squareColor + " border border-black"}
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
  if (team === "BLACK") {
    let startRow = 0;
    let endRow = 7;

    while (startRow < endRow) {
      const temp = list[startRow];
      list[startRow] = list[endRow];
      list[endRow] = temp;

      startRow++;
      endRow--;
    }
  }
  return (
    <>
      {
        <div
          className="grid grid-cols-8 grid-rows-8 w-fit touch-none"
          ref={boardElementRef}
        >
          {list}
        </div>
      }
    </>
  );
}
