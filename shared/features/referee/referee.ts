import { Piece } from "@/shared/constants/types";

export class Referee {
  board: (Piece | null)[][];
  private isMoveBoard: boolean[][];
  constructor(board: (Piece | null)[][], isMoveBoard: boolean[][]) {
    this.board = [...Array(8)].map(() => Array(8).fill(null));
    this.isMoveBoard = isMoveBoard;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let piece = board[i][j];
        this.board[i][j] = piece;
      }
    }
  }

  canMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    if (this.board[fromX][fromY] === null) return false;

    let movementHeatMap: Array<Array<null | string>> =
      this.extractCorrectPlacements(fromX, fromY);

    if (movementHeatMap[toX][toY] === "INVALID") return false;

    return true;
  }

  extractCorrectPlacements(
    x: number,
    y: number,
  ): Array<Array<"MOVE" | "ATTACK" | "INVALID">> {
    let temp: Array<Array<"MOVE" | "ATTACK" | "INVALID">> = [...Array(8)].map(
      () => Array(8).fill("INVALID"),
    );
    let targetPiece = this.board[x][y];

    if (!targetPiece) throw "cannot extract from null";

    switch (targetPiece.type) {
      case "PAWN": {
        if (targetPiece.team === "BLACK") {
          if (x === 1) {
            // initial double move case
            if (x + 1 < 8) {
              let piece = this.board[x + 1][y];
              let pawn = this.board[x][y];

              let posDia = this.board[x + 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";

                if (x + 2 < 8) {
                  let piece2 = this.board[x + 2][y];

                  if (piece2 === null) {
                    temp[x + 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            // normal move
            if (x + 1 < 8) {
              let piece = this.board[x + 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x + 1][y + 1];

              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x + 1][y - 1];
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
              let piece = this.board[x - 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
                if (x - 2 >= 0 && x - 2 < 8) {
                  let piece = this.board[x - 2][y];
                  let pawn = this.board[x][y];

                  if (piece === null) {
                    temp[x - 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = this.board[x - 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x - 1][y - 1];
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
        // console.log(this.board)
        let i: number = x + 1;
        while (i >= 0 && i < 8) {
          //since you acess . key typescript doesnt understand it same thing use var first
          let piece = this.board[i][y];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[i][y];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[x][j];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[x][j];
          let rook = this.board[x][y] as Piece;
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
          if (!isOutOfBound && this.board[nx][ny] === null) {
            temp[nx][ny] = "MOVE";
          }
          if (
            !isOutOfBound &&
            this.board[nx][ny] !== null &&
            this.board[x][y] &&
            this.board[nx][ny].team !== this.board[x][y].team
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              return [dx, dy];
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
              return [dx, dy];
            }
            temp[nx][ny] = "MOVE";
          }
        });

        const castlingMoves = [
          [0, -2],
          [0, 2],
        ];

        const piece = this.board[x][y];
        if (!piece) break;

        if (this.isMoveBoard[x][y]) break;
        if (
          !this.isMoveBoard[x][7] &&
          !this.board[x][y + 1] &&
          !this.board[x][y + 2]
        ) {
          const tempBoard = structuredClone(this.board);
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
          !this.isMoveBoard[x][0] &&
          !this.board[x][y - 1] &&
          !this.board[x][y - 2] &&
          !this.board[x][y - 3]
        ) {
          const tempBoard = structuredClone(this.board);
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
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
            let piece = this.board[i][y];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[i][y];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[x][j];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[x][j];
            let rook = this.board[x][y] as Piece;
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

  extractDangerPlacements(
    x: number,
    y: number,
  ): Array<Array<"MOVE" | "ATTACK" | "INVALID">> {
    let temp: Array<Array<"MOVE" | "ATTACK" | "INVALID">> = [...Array(8)].map(
      () => Array(8).fill("INVALID"),
    );
    let targetPiece = this.board[x][y];

    if (!targetPiece) throw "cannot extract from null";

    switch (targetPiece.type) {
      case "PAWN": {
        if (targetPiece.team === "BLACK") {
          if (x === 1) {
            // initial double move case
            if (x + 1 < 8) {
              let piece = this.board[x + 1][y];
              let pawn = this.board[x][y];

              let posDia = this.board[x + 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x + 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x + 1][y - 1] = "ATTACK";
              }

              if (piece === null) {
                temp[x + 1][y] = "MOVE";

                if (x + 2 < 8) {
                  let piece2 = this.board[x + 2][y];

                  if (piece2 === null) {
                    temp[x + 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            // normal move
            if (x + 1 < 8) {
              let piece = this.board[x + 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x + 1][y + 1];

              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x + 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x + 1][y - 1];
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
              let piece = this.board[x - 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x - 1][y - 1];
              if (y - 1 > -1 && negDia && negDia.team !== targetPiece.team) {
                temp[x - 1][y - 1] = "ATTACK";
              }
              if (piece === null) {
                temp[x - 1][y] = "MOVE";
                if (x - 2 >= 0 && x - 2 < 8) {
                  let piece = this.board[x - 2][y];
                  let pawn = this.board[x][y];

                  if (piece === null) {
                    temp[x - 2][y] = "MOVE";
                  }
                }
              }
            }
          } else {
            if (x - 1 >= 0 && x - 1 < 8) {
              let piece = this.board[x - 1][y];
              let pawn = this.board[x][y];
              let posDia = this.board[x - 1][y + 1];
              if (y + 1 < 8 && posDia && posDia.team !== targetPiece.team) {
                temp[x - 1][y + 1] = "ATTACK";
              }
              let negDia = this.board[x - 1][y - 1];
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
        // console.log(this.board)
        let i: number = x + 1;
        while (i >= 0 && i < 8) {
          //since you acess . key typescript doesnt understand it same thing use var first
          let piece = this.board[i][y];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[i][y];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[x][j];
          let rook = this.board[x][y] as Piece;
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
          let piece = this.board[x][j];
          let rook = this.board[x][y] as Piece;
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
          if (!isOutOfBound && this.board[nx][ny] === null) {
            temp[nx][ny] = "MOVE";
          }
          if (
            !isOutOfBound &&
            this.board[nx][ny] !== null &&
            this.board[x][y] &&
            this.board[nx][ny].team !== this.board[x][y].team
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              return [dx, dy];
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
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
            let piece = this.board[nx][ny];
            if (
              piece &&
              this.board[x][y] &&
              piece.team !== this.board[x][y].team
            ) {
              temp[nx][ny] = "ATTACK";
              break;
            }
            if (
              piece &&
              this.board[x][y] &&
              piece.team === this.board[x][y].team
            ) {
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
            let piece = this.board[i][y];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[i][y];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[x][j];
            let rook = this.board[x][y] as Piece;
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
            let piece = this.board[x][j];
            let rook = this.board[x][y] as Piece;
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

  extractDangerAreas(team: "BLACK" | "WHITE"): Array<Array<"DANGER" | "SAFE">> {
    const danger: Array<Array<"DANGER" | "SAFE">> = [...Array(8)].map(() =>
      Array(8).fill("SAFE"),
    );

    const mark = (x: number, y: number) => {
      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
        danger[x][y] = "DANGER";
      }
    };

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.board[x][y];

        if (!piece || piece.team !== team) continue;

        switch (piece.type) {
          case "PAWN": {
            const dir = team === "BLACK" ? 1 : -1;

            mark(x + dir, y + 1);
            mark(x + dir, y - 1);

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

            for (const [dx, dy] of moves) {
              mark(x + dx, y + dy);
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

            for (const [dx, dy] of moves) {
              mark(x + dx, y + dy);
            }

            break;
          }

          case "ROOK":
          case "QUEEN": {
            const directions = [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ];

            for (const [dx, dy] of directions) {
              let nx = x + dx;
              let ny = y + dy;

              while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                mark(nx, ny);

                if (this.board[nx][ny]) break;

                nx += dx;
                ny += dy;
              }
            }

            if (piece.type === "ROOK") break;
          }

          case "BISHOP":
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

              while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                mark(nx, ny);

                if (this.board[nx][ny]) break;

                nx += dx;
                ny += dy;
              }
            }

            break;
          }
        }
      }
    }

    return danger;
  }

  isChecked(team: "BLACK" | "WHITE", board?: (null | Piece)[][]): boolean {
    const localBoard = board ? board : this.board;

    let kingX = -1;
    let kingY = -1;

    // Find the king of the team
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = localBoard[x][y];

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
        const piece = localBoard[x][y];

        if (!piece || piece.team !== enemyTeam) continue;

        const moves = this.extractDangerPlacements(x, y);

        if (moves[kingX][kingY] === "ATTACK") {
          return true;
        }
      }
    }

    return false;
  }

  findKing(team: "BLACK" | "WHITE") {
    let kingX = -1;
    let kingY = -1;

    // Find the king of the team
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.board[x][y];

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
