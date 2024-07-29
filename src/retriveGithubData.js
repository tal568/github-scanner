import pLimit from "p-limit";
import {
  getRepositoryBaseData,
  getRepoContents,
  searchYamlFiles,
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
  const { size, isprivate } = await getRepositoryBaseData(owner, name);
  const contents = await getRepoContents(owner, name);
  const ymlFiles = await searchYamlFiles(owner, name);
  const numberOfFiles = await getNumberOfFiles(owner, name);
  let ymlContent = "";

  if (ymlFiles.length > 0) {
    ymlContent = await getYmlFileContent(owner, name, ymlFiles[0]);
  }
  const webhooks = await getRepoWebhooks(owner, name);
  return {
    name: name,
    size: size,
    owner: owner.login,
    publicStatus: isprivate,
    numberOfFiles: numberOfFiles,
    yamlContent: ymlContent,
    webhooks: webhooks,
  };
}
