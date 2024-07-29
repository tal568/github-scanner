import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getRepositoryBaseData(owner, repo) {
  try {
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    return repoData;
  } catch (error) {
    console.error(`Error fetching repository details: ${error.message}`);
    throw error;
  }
}

export async function getRepoContents(owner, repo) {
  try {
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: "",
    });
    return contents;
  } catch (error) {
    console.error(`Error fetching repository contents: ${error.message}`);
    throw error;
  }
}
export async function searchYamlFiles(owner, repo) {
  const query = `repo:${owner}/${repo} extension:yml`;

  try {
    const response = await octokit.search.code({ q: query });
    const files = response.data.items.map((item) => item.path);
    return files;
  } catch (error) {
    console.error(`Error searching YAML files: ${error.message}`);
    throw error;
  }
}

export async function getYmlFileContent(owner, repo, ymlFilePath) {
  try {
    const { data: ymlFileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: ymlFilePath,
    });
    return Buffer.from(ymlFileData.content, "base64").toString("utf-8");
  } catch (error) {
    console.error(`Error fetching YAML file content: ${error.message}`);
    throw error;
  }
}

export async function getRepoWebhooks(owner, repo) {
  try {
    const { data: webhooks } = await octokit.repos.listWebhooks({
      owner,
      repo,
    });
    return webhooks
      .filter((webhook) => webhook.active == true)
      .map((webhook) => webhook.config.url);
  } catch (error) {
    console.error(`Error fetching repository webhooks: ${error.message}`);
    throw error;
  }
}
export async function getNumberOfFiles(owner, repo, path = "") {
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  let count = 0;
  for (const file of data) {
    if (file.type === "file") {
      count++;
    } else if (file.type === "dir") {
      count += await getNumberOfFiles(owner, repo, file.path);
    }
  }
  return count;
}

// getRepoFileCount("tal568", "repoB");
//getRepoDetails("tal568", "test");

//getNumberOfFiles("tal568", "test");
