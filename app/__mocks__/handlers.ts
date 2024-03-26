import { http, HttpResponse, delay, graphql, passthrough, bypass } from "msw";
import { movies } from "./movies";
import { graphql as executeGraphql } from "graphql";
import schema from "./graphql-schema";

const customerService = graphql.link("http://api.example.com/review-service");

export const handlers = [
  http.get("https://api.example.com/movies/:slug/stream", async () => {
    const videoResponse = await fetch(
      "https://nickdesaulniers.github.io/netfix/demo/frag_bunny.mp4"
    );

    const videoStream = videoResponse.body;

    if (!videoStream) {
      return new HttpResponse(null, { status: 404 });
    }

    const latencyStream = new TransformStream({
      start() {},
      async transform(chunk, controller) {
        await delay(500);
        controller.enqueue(chunk);
      },
    });

    return new HttpResponse(
      videoStream.pipeThrough(latencyStream),
      videoResponse
    );
  }),

  http.get("/api/featured", async ({ request }) => {
    const response = await fetch(bypass(request));
    const originalMovies = await response.json();

    return HttpResponse.json(originalMovies.concat(movies));
  }),

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

  http.get("/api/recommendations", async ({ request }) => {
    const url = new URL(request.url);
    const movieId = url.searchParams.get("movieId");

    await delay(500);

    if (!movieId) {
      return HttpResponse.json(
        {
          error: 'Missing query parameter "movieId"',
        },
        { status: 400 }
      );
    }

    if (movieId === "8061539f-f0d6-4187-843f-a25aadf948eb") {
      return passthrough();
    }

    if (movieId === "b27e2d9-8b2e-4b7a-9b8a-7f9a0d7f7e0e") {
      return new HttpResponse(null, { status: 500 });
    }

    const recommendations = movies.filter((movie) => movie.id !== movieId);

    return HttpResponse.json(recommendations);
  }),

  http.post("https://auth.provider.com/validate", async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email");
    const password = data.get("password");

    if (!email || !password) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({
      id: "2b225b31-904a-443b-a898-a280fa8e0356",
      email,
      firstName: "John",
      lastName: "Maverick",
      avatarUrl: "https://i.pravatar.cc/100?img=12",
    });
  }),

  customerService.query("ListReviews", () => {
    return HttpResponse.json({
      data: {
        serviceReviews: [
          {
            id: "45e...",
            message: "Hello world",
          },
        ],
      },
    });
  }),

  graphql.operation(async ({ query, variables }) => {
    const { errors, data } = await executeGraphql({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        reviews({
          movieId,
        }: {
          movieId: string;
          id: string;
          text: string;
          rating: number;
          author: {
            firstName: string;
            avatarUrl: string;
          };
        }) {
          const movie = movies.find((movie) => movie.id === movieId);
          return movie?.reviews || [];
        },
        addReview({
          author,
          reviewInput,
        }: {
          author: {
            id: string;
            firstName: string;
            avatarUrl: string;
          };
          reviewInput: { movieId: string; text: string; rating: number };
        }) {
          const { movieId, text, rating } = reviewInput;

          const movie = movies.find((movie) => movie.id === movieId);

          if (!movie) {
            throw new Error(`Cannot find a movie by ID "${movieId}"`);
          }

          const newReview = {
            text,
            rating,
            id: Math.random().toString(16).slice(2),
            author,
          };

          movie.reviews = [...(movie.reviews || []), newReview];

          return newReview;
        },
      },
    });

    return HttpResponse.json({
      errors,
      data,
    });
  }),
];
