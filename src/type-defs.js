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
    yamlContent: String
    webhooks: [String]
    }

  type Query {
    repositories: [Repository]
    repository(name: String, owner: String): RepositoryAdvance
  }
`;
