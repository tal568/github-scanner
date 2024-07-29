import {
  getRepoDetails,
  getRepoContents,
  searchYamlFiles,
  getYmlFileContent,
  getRepoWebhooks,
} from "./github-api-integration.js";

export async function getRepositoriesDetailsParallel() {
  const limit = pLimit(2);
  const repositories = JSON.parse(process.env.REPOSITORIES);
  let promises = repositories.map((repo) => {
    return limit(() => fetchGithubRepositoriesData(repo.owner, repo.name));
  });

  const result = await Promise.all(promises);
  return result;
}
async function fetchGithubRepositoriesData(name) {
  let repoData = {};
  try {
    repoData = await getRepoDetails(owner, name);
  } catch (error) {
    console.error(`Error fetching repository from github: ${error.message}`);
    return {
      name: `error fetching repository name:${name}`,
      owner: owner,
      size: -1,
    };
  }
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
  };
}
export async function fetchRepositoryAdvanceDetails(name, owner) {
  const repositories = JSON.parse(process.env.REPOSITORIES);
  const currentRepo = repositories.find(
    (repostory) => repostory.name === name && repostory.owner === owner,
  );
  if (!currentRepo) {
    throw new Error(`Repository ${name} not found with owner ${owner}`);
  }
  const repoData = await getRepoDetails(owner, name);
  const contents = await getRepoContents(owner, name);
  const ymlFiles = await searchYamlFiles(owner, name);
  let ymlContent = "";

  if (ymlFiles.length > 0) {
    ymlContent = await getYmlFileContent(owner, name, ymlFiles[0]);
  }

  const webhooks = await getRepoWebhooks(owner, name);
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
    publicStatus: !repoData.private,
    numberOfFiles: contents.length,
    yamlContent: ymlContent,
    webhooks: webhooks,
  };
}
