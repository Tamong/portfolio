import { lazy } from "react";

export const games = {
  "fruit-box": {
    title: "Fruit Box",
    image: "/images/games/fruit-box.png",
    component: lazy(() => import("@/app/components/games/fruit-box/fruit-box")),
  },
  tetris: {
    title: "Tetris",
    image: "/images/games/tetris.png",
    component: lazy(() => import("@/app/components/games/tetris/tetris")),
  },

  // Add more games here
  // 'tetris': {
  //   title: 'Tetris',
  //   component: lazy(() => import('@/app/components/games/tetris/tetris')),
  // },
} as const;

export type GameSlug = keyof typeof games;
