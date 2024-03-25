import { buildSchema } from "graphql";

const graphqlSchema = buildSchema(`
    type Movie {
        id: ID!
        title: String!
        slug: String!
        category: String!
        releasedAt: String!
        description: String!
        imageUrl: String!
    }

    type Review {
        id: ID!
        text: String!
        rating: Int!
        author: User!
    }

    type User {
        id: ID!
        firstName: String!
        avatarUrl: String!
    }

    input UserInput {
        id: ID!
        firstName: String!
        avatarUrl: String!
    }

    input ReviewInput {
        movieId: ID!
        text: String!
        rating: Int!
    }

    type Query {
        reviews(movieId: ID!): [Review!]
    }

    type Mutation {
        addReview(author: UserInput!, reviewInput: ReviewInput!): Review
    }
`);

export default graphqlSchema;
