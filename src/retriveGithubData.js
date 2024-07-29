import pLimit from "p-limit";
import {
  getRepositoryBaseData,
  searchYmlFilePath,
  getYmlFileContent,
  getRepoWebhooks,
  getNumberOfFiles,
} from "./github-api-integration.js";

export async function retriveRepositoriesBaseFieldsInParallel() {
  const limit = pLimit(2);
  const repositories = JSON.parse(process.env.REPOSITORIES);
  let promises = repositories.map((repo) => {
    return limit(() =>
      retriveGithubRepositoriesBaseFields(repo.name, repo.owner),
    );
  });

  const result = await Promise.all(promises);
  return result;
}
async function retriveGithubRepositoriesBaseFields(name, owner) {
  let repoData = {};
  try {
    repoData = await getRepositoryBaseData(owner, name);
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
export async function retriveRepositoryExtendedFields(name, owner) {
  const repositories = JSON.parse(process.env.REPOSITORIES);
  const currentRepo = repositories.find(
    (repostory) => repostory.name === name && repostory.owner === owner,
  );
  if (!currentRepo) {
    throw new Error(`Repository ${name} not found with owner ${owner}`);
  }

  const [repoData, ymlFilePath, numberOfFiles] = await Promise.all([
    getRepositoryBaseData(owner, name),
    searchYmlFilePath(owner, name),
    getNumberOfFiles(owner, name),
  ]);

  let ymlContent = "";

  if (ymlFilePath != undefined) {
    ymlContent = await getYmlFileContent(owner, name, ymlFilePath);
  }
  const webhooks = await getRepoWebhooks(owner, name);
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
    publicStatus: repoData.private,
    numberOfFiles: numberOfFiles,
    yamlContent: ymlContent,
    webhooks: webhooks,
  };
}
