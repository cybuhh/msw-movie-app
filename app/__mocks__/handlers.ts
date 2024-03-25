import { http, HttpResponse } from "msw";

const reviews = [
  {
    id: "04be0fb5-19f6-411c-9257-bcef6cd203c2",
    text: "One of my favorite films of all time.",
    rating: 5,
    author: {
      firstName: "Kate",
      avatarUrl: "https://i.pravatar.cc/100?img=1",
    },
  },
];

const movies = [
  {
    id: "8061539f-f0d6-4187-843f-a25aadf948eb",
    slug: "the-shawshank-redemption",
    title: "The Shawshank Redemption",
    category: "Drama",
    releasedAt: new Date("1994-10-14"),
    description:
      "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_FMjpg_UX1200_.jpg",
  },
  {
    id: "3342a4f2-144b-4cef-8041-676affedfbb8",
    slug: "the-godfather",
    title: "The Godfather",
    category: "Drama",
    releasedAt: new Date("1972-03-24"),
    description:
      "Don Vito Corleone, head of a mafia family, decides to hand over his empire to his youngest son Michael. However, his decision unintentionally puts the lives of his loved ones in grave danger.",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UY1982_.jpg",
    reviews,
  },
  {
    id: "b2b7e2d9-8b2e-4b7a-9b8a-7f9a0d7f7e0e",
    title: "The Dark Knight",
    slug: "the-dark-knight",
    category: "Action",
    releasedAt: new Date("2008-07-18"),
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    imageUrl:
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UY2048_.jpg",
  },
];

export const handlers = [
  http.get("https://api.example.com/movies/featured", () => {
    return HttpResponse.json(movies);
  }),

  http.get("https://api.example.com/movies/:slug", ({ params }) => {
    const { slug } = params;

    const movie = movies.find((movie) => movie.slug === slug);

    if (movie) {
      return HttpResponse.json(movie);
    }

    return new HttpResponse("Not found", { status: 404 });
  }),

  http.get("/api/recommendations", () => {
    return HttpResponse.json(movies.slice(0, 2));
  }),
];
