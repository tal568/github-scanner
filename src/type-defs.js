export const typeDefs = `#graphql

  type Repository {
    name: String
    size: Int
    owner: String
  }
  type RepositoryAdvance {
    name: String
    size: Int
    owner: String
    publicStatus: Boolean
    numberOfFiles: Int
    yamlContent: String}

  type Query {
    repositories: [Repository]
    repositorie(name: String): RepositoryAdvance
  }
`;
