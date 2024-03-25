import { http, HttpResponse, delay, graphql } from "msw";
import { movies } from "./movies";

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

    if (movieId === "b2b7e2d9-8b2e-4b7a-9b8a-7f9a0d7f7e0e") {
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

  graphql.query("ListReviews", ({ variables }) => {
    const { movieId } = variables;
    const movie = movies.find((movie) => movie.id === movieId);
    const reviews = movie?.reviews || [];

    return HttpResponse.json({
      data: {
        reviews,
      },
    });
  }),

  graphql.mutation("AddReview", ({ variables }) => {
    const { author, reviewInput } = variables;
    const { movieId, ...review } = reviewInput;

    const movie = movies.find((movie) => movie.id === movieId);

    if (!movie) {
      return HttpResponse.json({
        errors: [
          {
            message: `Cannot find a movie by ID "${movieId}"`,
          },
        ],
      });
    }

    const newReview = {
      ...review,
      id: Math.random().toString(16).slice(2),
      author,
    };

    const prevReviews = movie.reviews || [];
    movie.reviews = prevReviews.concat(newReview);

    return HttpResponse.json({
      data: {
        addReview: newReview,
      },
    });
  }),
];
