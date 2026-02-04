import { Actor } from "./actors.types";

export const ACTORS: Actor[] = [
  {
    id: 1,
    name: "Timothée Chalamet",

    birthDate: "December 27, 1995",
    birthPlace: "New York City, USA",

    biography:
      "Timothée Hal Chalamet is an American actor widely regarded for emotionally complex performances and his rapid rise in modern cinema.",

    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",

    coverImage:
      "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?auto=format&fit=crop&w=2000&q=80",

    social: {
      instagram: "https://instagram.com/tchalamet",
      twitter: "https://twitter.com/realchalamet",
      imdb: "https://www.imdb.com/name/nm3154303/",
    },

    awards: [
      {
        name: "Academy Award Nomination",
        year: 2018,
        film: "Call Me by Your Name",
        category: "Best Actor",
        isWinner: false,
      },
      {
        name: "Golden Globe Nomination",
        year: 2018,
        film: "Call Me by Your Name",
        category: "Best Actor",
        isWinner: false,
      },
    ],

    // 🔥 120 items → virtualization required
    filmography: Array.from({ length: 120 }, (_, i) => ({
      id: i + 1,
      title: `Film ${i + 1}`,
      role: i % 2 === 0 ? "Lead Role" : "Supporting Role",
      year: 2000 + (i % 25),
      rating: Number((7 + Math.random() * 2).toFixed(1)),
      poster:
        "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
    })),

    similarActors: [
      {
        id: 2,
        name: "Zendaya",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: 3,
        name: "Florence Pugh",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];
