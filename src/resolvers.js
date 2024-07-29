import {
  getRepoDetails,
  getRepoContents,
  searchYamlFiles,
  getYmlFileContent,
  getRepoWebhooks,
} from "./github-api-integrasion.js";
import pLimit from "p-limit";
// const repos = [
//    {owner:"tal568", repo:"repoA"},
//     {owner:"tal568", repo:"repoB"},
//     {owner:"tal568", repo:"repoC"},
// ] used from env
export const resolvers = {
  Query: {
    repositories: async () => await getRepositoriesDetails(),
    repositorie: async (_, { repositoryName }) =>
      repos.find((repo) => repo.repositoryName === repositoryName),
  },
};

async function getRepositoriesDetails() {
  const limit = pLimit(2);
  const repositories = JSON.parse(process.env.REPOSITORIES);
  let promises = repositories.map((repo) => {
    return limit(() =>
      fetchGithubRepositoriessData(repo.owner, repo.repo, false),
    );
  });

  const result = await Promise.all(promises);
  return result;
}
async function fetchGithubRepositoriessData(owner, repo) {
  let repoData = {};
  try {
    repoData = await getRepoDetails(owner, repo);
  } catch (error) {
    console.error(`Error fetching repository from github: ${error.message}`);
    return { name: `error fetching repo:${repo}`, owner: owner, size: -1 };
  }
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
  };
}
async function fetchRepoAdvanceDetails(owner, repo) {
  const repoData = await getRepoDetails(owner, repo);
  const contents = await getRepoContents(owner, repo);

  //todo fix  yml dont work for repo a and c
  const ymlFiles = await searchYamlFiles(owner, repo);

  let ymlContent = "";

  if (ymlFiles.length > 0) {
    ymlContent = await getYmlFileContent(owner, repo, ymlFiles[0]);
  }

  const webhooks = await getRepoWebhooks(owner, repo);
  return { repoData, contents, ymlContent, webhooks };
}
