export const typeDefs = `#graphql

  type Repository {
    repositoryName: String
    repositorySize: Int
    repositoryOwner: String
  }

  type Query {
    repositories: [Repository]
    repositorie(repositoryName: String): Repository
  }
`;