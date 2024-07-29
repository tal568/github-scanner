import pLimit from "p-limit";
import {
  getRepositoryBaseData,
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

  const [repoData, ymlFiles, numberOfFiles] = await Promise.all([
    getRepositoryBaseData(owner, name),
    searchYamlFiles(owner, name),
    getNumberOfFiles(owner, name),
  ]);

  let ymlContent = "";

  if (ymlFiles.length > 0) {
    ymlContent = await getYmlFileContent(owner, name, ymlFiles[0]);
  }
  const webhooks = await getRepoWebhooks(owner, name);
  return {
    name: repoData.name,
    size: repoData.size,
    owner: repoData.owner.login,
    publicStatus: repoData.isprivate,
    numberOfFiles: numberOfFiles,
    yamlContent: ymlContent,
    webhooks: webhooks,
  };
}
