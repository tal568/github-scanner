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
    repositorie: async (_, { name }) =>
      fetchRepositoryAdvanceDetails(name),
  },
};

async function getRepositoriesDetails() {
  const limit = pLimit(2);
  const repositories = JSON.parse(process.env.REPOSITORIES);
  let promises = repositories.map((repo) => {
    return limit(() =>
      fetchGithubRepositoriessData(repo.owner, repo.name, false),
    );
  });

  const result = await Promise.all(promises);
  return result;
}
async function fetchGithubRepositoriessData(owner, name) {
  let repoData = {};
  try {
    repoData = await getRepoDetails(owner, name);
  } catch (error) {
    console.error(`Error fetching repository from github: ${error.message}`);
    return { name: `error fetching repository name:${name}`, owner: owner, size: -1 };
  }
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
  };
}
async function fetchRepositoryAdvanceDetails(repostoryName) {
  const repositories=JSON.parse(process.env.REPOSITORIES)
  const currentRepo = repositories.find((repostory) => repostory.name === repostoryName);
  if (!currentRepo) {
    throw new Error(`Repository ${repostoryName} not found`);
  }
  const {owner, name} = currentRepo
  const repoData = await getRepoDetails(owner, name);
  const contents = await getRepoContents(owner, name);
  const ymlFiles = await searchYamlFiles(owner, name);
  let ymlContent = "";

  if (ymlFiles.length > 0) {
    ymlContent = await getYmlFileContent(owner, name, ymlFiles[0]);
  }

  const webhooks = await getRepoWebhooks(owner, name);
  return {name: repoData.name, size: repoData.size, owner: repoData.owner.login, publicStatus: !repoData.private, numberOfFiles: contents.length, yamlContent: ymlContent, webhooks: webhooks};
}
