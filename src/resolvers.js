import {
  retriveRepositoryExtendedFields,
  retriveRepositoriesBaseFieldsInParallel,
} from "./retriveGithubData.js";
// const repos = [
//    {owner:"tal568", repo:"repoA"},
//     {owner:"tal568", repo:"repoB"},
//     {owner:"tal568", repo:"repoC"},
// ] used from env
export const resolvers = {
  Query: {
    repositories: async () => await retriveRepositoriesBaseFieldsInParallel(),
    repository: async (_, { name, owner }) =>
      retriveRepositoryExtendedFields(name, owner),
  },
};
