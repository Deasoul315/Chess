import { Piece } from "../constants.ts/types";

export class Referee {
  canMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    board: (Piece | null)[][],
    isMoveBoard: boolean[][],
  ): boolean {
    if (board[fromX][fromY] === null) return false;

    let movementHeatMap: Array<Array<null | string>> =
      this.extractCorrectPlacements(fromX, fromY, board, isMoveBoard);

    if (movementHeatMap[toX][toY] === "INVALID") return false;

    return true;
  }

  extractCorrectPlacements(
    x: number,
    y: number,
    board: (Piece | null)[][],
    isMoveBoard: boolean[][],
  ): Array<Array<"MOVE" | "ATTACK" | "INVALID">> {
    let temp: Array<Array<"MOVE" | "ATTACK" | "INVALID">> = [...Array(8)].map(
      () => Array(8).fill("INVALID"),
    );
    let targetPiece = board[x][y];

    if (!targetPiece) throw "cannot extract from null";

    switch (targetPiece.type) {
      case "PAWN": {
        if (targetPiece.team === "BLACK") {
          if (x === 1) {
            // initial double move case
            if (x + 1 < 8) {
              let piece = board[x + 1][y];
              let pawn = board[x][y];

              let posDia = board[x + 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";

                if (x + 2 < 8) {
                  let piece2 = board[x + 2][y];

                  if (piece2 === null) {
                    temp[x + 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            // normal move
            if (x + 1 < 8) {
              let piece = board[x + 1][y];
              let pawn = board[x][y];
              let posDia = board[x + 1][y + 1];

              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";
              }
            }
          }
        } else {
          if (x === 6) {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = board[x - 1][y];
              let pawn = board[x][y];
              let posDia = board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
                if (x - 2 >= 0 && x - 2 < 8) {
                  let piece = board[x - 2][y];
                  let pawn = board[x][y];

                  if (piece === null) {
                    temp[x - 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = board[x - 1][y];
              let pawn = board[x][y];
              let posDia = board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
              }
            }
          }
        }
        break;
      }

      case "ROOK": {
        // console.log(board)
        let i: number = x + 1;
        while (i >= 0 && i < 8) {
          //since you acess . key typescript doesnt understand it same thing use var first
          let piece = board[i][y];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[i][y] = "ATTACK";
            break;
          }
          temp[i][y] = "MOVE";
          i++;
        }
        i = x - 1;
        while (i >= 0 && i < 8) {
          let piece = board[i][y];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[i][y] = "ATTACK";
            break;
          }

          temp[i][y] = "MOVE";
          i--;
        }
        let j: number = y + 1;
        while (j >= 0 && j < 8) {
          let piece = board[x][j];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[x][j] = "ATTACK";
            break;
          }

          temp[x][j] = "MOVE";
          j++;
        }
        j = y - 1;
        while (j >= 0 && j < 8) {
          let piece = board[x][j];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[x][j] = "ATTACK";
            break;
          }

          temp[x][j] = "MOVE";
          j--;
        }
        break;
      }

      case "KNIGHT": {
        const moves = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2],
        ];

        moves.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          let isOutOfBound = nx < 0 || nx > 7 || ny < 0 || ny > 7;
          if (!isOutOfBound && board[nx][ny] === null) {
            temp[nx][ny] = "MOVE";
          }
          if (
            !isOutOfBound &&
            board[nx][ny] !== null &&
            board[x][y] &&
            board[nx][ny].team !== board[x][y].team
          ) {
            temp[nx][ny] = "ATTACK";
          }
        });
        break;
      }

      case "BISHOP": {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let nx = x + dx;
          let ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          while (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              break;
            }
            temp[nx][ny] = "MOVE";
            nx += dx;
            ny += dy;
            isOutOfBound = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          }
        }
        break;
      }

      case "KING": {
        const moves = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        moves.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          if (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              return [dx, dy];
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              return [dx, dy];
            }
            temp[nx][ny] = "MOVE";
          }
        });

        const castlingMoves = [
          [0, -2],
          [0, 2],
        ];

        let kPos = {
          x: targetPiece.team === "BLACK" ? 0 : 7,
          y: 4,
        };
        let rRookPos = {
          x: targetPiece.team === "BLACK" ? 0 : 7,
          y: 7,
        };
        let lRookPos = {
          x: targetPiece.team === "BLACK" ? 0 : 7,
          y: 0,
        };
        const piece = board[x][y];
        if (!piece) break;
        console.log("is move board", isMoveBoard);
        if (isMoveBoard[kPos.x][kPos.y]) break;
        console.log("allow");
        if (
          !isMoveBoard[rRookPos.x][rRookPos.y] &&
          !board[x][y + 1] &&
          !board[x][y + 2]
        ) {
          const tempBoard = structuredClone(board);
          let isCastling = true;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          tempBoard[x][y + 1] = tempBoard[x][y];
          tempBoard[x][y] = null;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          tempBoard[x][y + 2] = tempBoard[x][y + 1];
          tempBoard[x][y + 1] = null;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          if (isCastling) {
            temp[x][y + 2] = "MOVE";
          }
        }
        if (
          !isMoveBoard[lRookPos.x][lRookPos.y] &&
          !board[x][y - 1] &&
          !board[x][y - 2] &&
          !board[x][y - 3]
        ) {
          const tempBoard = structuredClone(board);
          let isCastling = true;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          tempBoard[x][y - 1] = tempBoard[x][y];
          tempBoard[x][y] = null;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          tempBoard[x][y - 2] = tempBoard[x][y - 1];
          tempBoard[x][y - 1] = null;
          isCastling = isCastling && !this.isChecked(piece.team, tempBoard);
          if (isCastling) {
            temp[x][y - 2] = "MOVE";
          }
        }
        break;
      }

      case "QUEEN": {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let nx = x + dx;
          let ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          while (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              break;
            }
            temp[nx][ny] = "MOVE";
            nx += dx;
            ny += dy;
            isOutOfBound = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          }

          let i: number = x + 1;
          while (i >= 0 && i < 8) {
            //since you acess . key typescript doesnt understand it same thing use var first
            let piece = board[i][y];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[i][y] = "ATTACK";
              break;
            }
            temp[i][y] = "MOVE";
            i++;
          }
          i = x - 1;
          while (i >= 0 && i < 8) {
            let piece = board[i][y];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[i][y] = "ATTACK";
              break;
            }

            temp[i][y] = "MOVE";
            i--;
          }
          let j: number = y + 1;
          while (j >= 0 && j < 8) {
            let piece = board[x][j];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[x][j] = "ATTACK";
              break;
            }

            temp[x][j] = "MOVE";
            j++;
          }
          j = y - 1;
          while (j >= 0 && j < 8) {
            let piece = board[x][j];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[x][j] = "ATTACK";
              break;
            }

            temp[x][j] = "MOVE";
            j--;
          }
        }
        break;
      }
    }

    for (let tx = 0; tx < 8; tx++) {
      for (let ty = 0; ty < 8; ty++) {
        if (temp[tx][ty] === "INVALID") continue;

        const tempBoard = structuredClone(board);

        // make move
        tempBoard[tx][ty] = tempBoard[x][y];
        tempBoard[x][y] = null;

        // if king survives, check can be escaped
        if (this.isChecked(targetPiece.team, tempBoard)) {
          temp[tx][ty] = "INVALID";
        }
      }
    }

    return temp;
  }

  extractDangerPlacements(
    x: number,
    y: number,
    board: (Piece | null)[][],
  ): Array<Array<"MOVE" | "ATTACK" | "INVALID">> {
    let temp: Array<Array<"MOVE" | "ATTACK" | "INVALID">> = [...Array(8)].map(
      () => Array(8).fill("INVALID"),
    );
    let targetPiece = board[x][y];

    if (!targetPiece) throw "cannot extract from null";

    switch (targetPiece.type) {
      case "PAWN": {
        if (targetPiece.team === "BLACK") {
          if (x === 1) {
            // initial double move case
            if (x + 1 < 8) {
              let piece = board[x + 1][y];
              let pawn = board[x][y];

              let posDia = board[x + 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";

                if (x + 2 < 8) {
                  let piece2 = board[x + 2][y];

                  if (piece2 === null) {
                    temp[x + 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            // normal move
            if (x + 1 < 8) {
              let piece = board[x + 1][y];
              let pawn = board[x][y];
              let posDia = board[x + 1][y + 1];

              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";
              }
            }
          }
        } else {
          if (x === 6) {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = board[x - 1][y];
              let pawn = board[x][y];
              let posDia = board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
                if (x - 2 >= 0 && x - 2 < 8) {
                  let piece = board[x - 2][y];
                  let pawn = board[x][y];

                  if (piece === null) {
                    temp[x - 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = board[x - 1][y];
              let pawn = board[x][y];
              let posDia = board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
              }
            }
          }
        }
        break;
      }

      case "ROOK": {
        // console.log(board)
        let i: number = x + 1;
        while (i >= 0 && i < 8) {
          //since you acess . key typescript doesnt understand it same thing use var first
          let piece = board[i][y];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[i][y] = "ATTACK";
            break;
          }
          temp[i][y] = "MOVE";
          i++;
        }
        i = x - 1;
        while (i >= 0 && i < 8) {
          let piece = board[i][y];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[i][y] = "ATTACK";
            break;
          }

          temp[i][y] = "MOVE";
          i--;
        }
        let j: number = y + 1;
        while (j >= 0 && j < 8) {
          let piece = board[x][j];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[x][j] = "ATTACK";
            break;
          }

          temp[x][j] = "MOVE";
          j++;
        }
        j = y - 1;
        while (j >= 0 && j < 8) {
          let piece = board[x][j];
          let rook = board[x][y] as Piece;
          if (piece !== null && piece.team === rook.team) {
            break;
          }
          if (piece !== null && piece.team !== rook.team) {
            temp[x][j] = "ATTACK";
            break;
          }

          temp[x][j] = "MOVE";
          j--;
        }
        break;
      }

      case "KNIGHT": {
        const moves = [
          [2, 1],
          [2, -1],
          [-2, 1],
          [-2, -1],
          [1, 2],
          [1, -2],
          [-1, 2],
          [-1, -2],
        ];

        moves.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          let isOutOfBound = nx < 0 || nx > 7 || ny < 0 || ny > 7;
          if (!isOutOfBound && board[nx][ny] === null) {
            temp[nx][ny] = "MOVE";
          }
          if (
            !isOutOfBound &&
            board[nx][ny] !== null &&
            board[x][y] &&
            board[nx][ny].team !== board[x][y].team
          ) {
            temp[nx][ny] = "ATTACK";
          }
        });
        break;
      }

      case "BISHOP": {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let nx = x + dx;
          let ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          while (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              break;
            }
            temp[nx][ny] = "MOVE";
            nx += dx;
            ny += dy;
            isOutOfBound = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          }
        }
        break;
      }

      case "KING": {
        const moves = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        moves.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          if (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              return [dx, dy];
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              return [dx, dy];
            }
            temp[nx][ny] = "MOVE";
          }
        });

        break;
      }

      case "QUEEN": {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];

        for (const [dx, dy] of directions) {
          let nx = x + dx;
          let ny = y + dy;
          let isOutOfBound: boolean = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          while (!isOutOfBound) {
            let piece = board[nx][ny];
            if (piece && board[x][y] && piece.team !== board[x][y].team) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (piece && board[x][y] && piece.team === board[x][y].team) {
              break;
            }
            temp[nx][ny] = "MOVE";
            nx += dx;
            ny += dy;
            isOutOfBound = !(nx >= 0 && nx < 8 && ny >= 0 && ny < 8);
          }

          let i: number = x + 1;
          while (i >= 0 && i < 8) {
            //since you acess . key typescript doesnt understand it same thing use var first
            let piece = board[i][y];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[i][y] = "ATTACK";
              break;
            }
            temp[i][y] = "MOVE";
            i++;
          }
          i = x - 1;
          while (i >= 0 && i < 8) {
            let piece = board[i][y];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[i][y] = "ATTACK";
              break;
            }

            temp[i][y] = "MOVE";
            i--;
          }
          let j: number = y + 1;
          while (j >= 0 && j < 8) {
            let piece = board[x][j];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[x][j] = "ATTACK";
              break;
            }

            temp[x][j] = "MOVE";
            j++;
          }
          j = y - 1;
          while (j >= 0 && j < 8) {
            let piece = board[x][j];
            let rook = board[x][y] as Piece;
            if (piece !== null && piece.team === rook.team) {
              break;
            }
            if (piece !== null && piece.team !== rook.team) {
              temp[x][j] = "ATTACK";
              break;
            }

            temp[x][j] = "MOVE";
            j--;
          }
        }
        break;
      }
    }

    return temp;
  }

  // extractDangerAreas(team: "BLACK" | "WHITE"): Array<Array<"DANGER" | "SAFE">> {
  //   const danger: Array<Array<"DANGER" | "SAFE">> = [...Array(8)].map(() =>
  //     Array(8).fill("SAFE"),
  //   );

  //   const mark = (x: number, y: number) => {
  //     if (x >= 0 && x < 8 && y >= 0 && y < 8) {
  //       danger[x][y] = "DANGER";
  //     }
  //   };

  //   for (let x = 0; x < 8; x++) {
  //     for (let y = 0; y < 8; y++) {
  //       const piece = board[x][y];

  //       if (!piece || piece.team !== team) continue;

  //       switch (piece.type) {
  //         case "PAWN": {
  //           const dir = team === "BLACK" ? 1 : -1;

  //           mark(x + dir, y + 1);
  //           mark(x + dir, y - 1);

  //           break;
  //         }

  //         case "KNIGHT": {
  //           const moves = [
  //             [2, 1],
  //             [2, -1],
  //             [-2, 1],
  //             [-2, -1],
  //             [1, 2],
  //             [1, -2],
  //             [-1, 2],
  //             [-1, -2],
  //           ];

  //           for (const [dx, dy] of moves) {
  //             mark(x + dx, y + dy);
  //           }

  //           break;
  //         }

  //         case "KING": {
  //           const moves = [
  //             [1, 0],
  //             [-1, 0],
  //             [0, 1],
  //             [0, -1],
  //             [1, 1],
  //             [1, -1],
  //             [-1, 1],
  //             [-1, -1],
  //           ];

  //           for (const [dx, dy] of moves) {
  //             mark(x + dx, y + dy);
  //           }

  //           break;
  //         }

  //         case "ROOK":
  //         case "QUEEN": {
  //           const directions = [
  //             [1, 0],
  //             [-1, 0],
  //             [0, 1],
  //             [0, -1],
  //           ];

  //           for (const [dx, dy] of directions) {
  //             let nx = x + dx;
  //             let ny = y + dy;

  //             while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
  //               mark(nx, ny);

  //               if (board[nx][ny]) break;

  //               nx += dx;
  //               ny += dy;
  //             }
  //           }

  //           if (piece.type === "ROOK") break;
  //         }

  //         case "BISHOP":
  //         case "QUEEN": {
  //           const directions = [
  //             [1, 1],
  //             [1, -1],
  //             [-1, 1],
  //             [-1, -1],
  //           ];

  //           for (const [dx, dy] of directions) {
  //             let nx = x + dx;
  //             let ny = y + dy;

  //             while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
  //               mark(nx, ny);

  //               if (board[nx][ny]) break;

  //               nx += dx;
  //               ny += dy;
  //             }
  //           }

  //           break;
  //         }
  //       }
  //     }
  //   }

  //   return danger;
  // }

  isChecked(team: "BLACK" | "WHITE", board: (Piece | null)[][]): boolean {
    let kingX = -1;
    let kingY = -1;

    // Find the king of the team
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board[x][y];

        if (piece && piece.type === "KING" && piece.team === team) {
          kingX = x;
          kingY = y;
          break;
        }
      }

      if (kingX !== -1) break;
    }

    if (kingX === -1) {
      throw new Error("King not found");
    }

    const enemyTeam = team === "BLACK" ? "WHITE" : "BLACK";

    // Check every enemy piece
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board[x][y];

        if (!piece || piece.team !== enemyTeam) continue;

        const moves = this.extractDangerPlacements(x, y, board);
        // console.log("danger zones for piece ", piece, moves);
        if (moves[kingX][kingY] === "ATTACK") {
          // console.log("piece can attack enemy king ", piece);
          // console.log("king is at", kingX, kingY);
          return true;
        }
      }
    }

    return false;
  }

  canEscapeCheck(
    team: "BLACK" | "WHITE",
    board: (Piece | null)[][],
    isMoveBoard: boolean[][],
  ): boolean {
    // console.log("can this team escape ? ", team);
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board[x][y];

        if (!piece || piece.team !== team) continue;

        const moves = this.extractCorrectPlacements(x, y, board, isMoveBoard);

        // console.log("trying for this piece ", piece);
        for (let tx = 0; tx < 8; tx++) {
          for (let ty = 0; ty < 8; ty++) {
            if (moves[tx][ty] === "INVALID") continue;

            const tempBoard = structuredClone(board);

            // make move
            tempBoard[tx][ty] = tempBoard[x][y];
            tempBoard[x][y] = null;

            // if king survives, check can be escaped
            if (!this.isChecked(team, tempBoard)) {
              console.log("can escape with move ", tx, ty);
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  private isInsufficientMaterial(board: (Piece | null)[][]): boolean {
    const pieces: {
      type: Piece["type"];
      team: Piece["team"];
      x: number;
      y: number;
    }[] = [];

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board[x][y];

        if (piece) {
          pieces.push({
            type: piece.type,
            team: piece.team,
            x,
            y,
          });
        }
      }
    }

    // Remove kings
    const nonKings = pieces.filter((p) => p.type !== "KING");

    // K vs K
    if (nonKings.length === 0) {
      return true;
    }

    // K+B vs K
    if (
      nonKings.length === 1 &&
      (nonKings[0].type === "BISHOP" || nonKings[0].type === "KNIGHT")
    ) {
      return true;
    }

    // K+B vs K+B (same color bishops)
    if (nonKings.length === 2 && nonKings.every((p) => p.type === "BISHOP")) {
      const bishop1 = nonKings[0];
      const bishop2 = nonKings[1];

      const color1 = (bishop1.x + bishop1.y) % 2;
      const color2 = (bishop2.x + bishop2.y) % 2;

      if (color1 === color2) {
        return true;
      }
    }

    return false;
  }

  public isDraw(board: (Piece | null)[][]) {
    return this.isInsufficientMaterial(board);
  }

  findKing(team: "BLACK" | "WHITE", board: (Piece | null)[][]) {
    let kingX = -1;
    let kingY = -1;

    // Find the king of the team
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = board[x][y];

        if (piece && piece.type === "KING" && piece.team === team) {
          kingX = x;
          kingY = y;
          break;
        }
      }

      if (kingX !== -1) break;
    }

    if (kingX === -1) {
      throw new Error("King not found");
    }

    return {
      x: kingX,
      y: kingY,
    };
  }
}
