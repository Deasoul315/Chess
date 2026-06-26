import { createTheme } from "@mantine/core";
import localFont from "next/font/local";
export const PIECES_TYPE = {
  PAWN: "PAWN",
  ROOK: "ROOK",
  BISHOP: "BISHOP",
  KNIGHT: "KNIGHT",
  QUEEN: "QUEEN",
  KING: "KING",
} as const;

export let chessXAxis: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
export let chessYAxis: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const AGATE_GROTESK = localFont({
  src: "../../public/Agate Grotesk/Agate Grotesk.ttf",
  variable: "--font-local-agate-grotesk",
});

export const theme = createTheme({
  colors: {
    primary: [
      "#fca311",
      "#fca311",
      "#fca311",
      "#fca311",
      "#fca311", // shade 4
      "#fca311",
      "#fca311",
      "#fca311",
      "#fca311",
      "#fca311",
    ],

    secondary: [
      "#14213d",
      "#14213d",
      "#14213d",
      "#14213d",
      "#14213d", // shade 4
      "#14213d",
      "#14213d",
      "#14213d",
      "#14213d",
      "#14213d",
    ],
    // Add your color
    deepBlue: [
      "#eef3ff",
      "#dce4f5",
      "#b9c7e2",
      "#94a8d0",
      "#748dc1",
      "#5f7cb8",
      "#5474b4",
      "#44639f",
      "#39588f",
      "#2d4b81",
    ],
    // or replace default theme color
    blue: [
      "#eef3ff",
      "#dee2f2",
      "#bdc2de",
      "#98a0ca",
      "#7a84ba",
      "#6672b0",
      "#5c68ac",
      "#4c5897",
      "#424e88",
      "#364379",
    ],
  },

  shadows: {
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },

  fontFamily: AGATE_GROTESK.className,

  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "20px", // your regular text
    xl: "30px",
  },

  headings: {
    fontWeight: "900",
    fontFamily: AGATE_GROTESK.className,
    sizes: {
      h1: {
        fontSize: "48px",
        lineHeight: "1.1",
      },
      h2: {
        fontSize: "40px",
        lineHeight: "1.1",
      },
      h3: {
        fontSize: "32px",
        lineHeight: "1.1",
      },
      h4: {
        fontSize: "24px",
        lineHeight: "1.1",
      },
      h5: {
        fontSize: "20px",
        lineHeight: "1.1",
      },
      h6: {
        fontSize: "16px",
        lineHeight: "1.1",
      },
    },
  },

  breakpoints: {
    xs: "30em",
    sm: "40em",
    md: "56em",
    lg: "75em",
    xl: "90em",
    xxl: "110em",
  },
});

export const Domain = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
} as const;

export const PieceColor = {
  WHITE: "WHITE",
  BLACK: "BLACK",
} as const;

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const userNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
