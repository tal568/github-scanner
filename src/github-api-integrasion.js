import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';

dotenv.config();
const octokit = new Octokit({ 
  auth: process.env.GIT_HUB_TOKEN

});

async function getRepoDetails(owner, repo) {
  try {
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo
    });
    return repoData;
  } catch (error) {
    console.error(`Error fetching repository details: ${error.message}`);
  }
}

async function getRepoContents(owner, repo) {
  try {
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: '',
    });
    return contents;
  } catch (error) {
    console.error(`Error fetching repository contents: ${error.message}`);
  }
}
async function searchYamlFiles(owner, repo) {
  const query = `repo:${owner}/${repo} extension:yml`;
  const response = await octokit.search.code({q: query});
  const files = response.data.items.map(item => item.path);
  return files;
}

async function getYmlFileContent(owner, repo, ymlFilePath) {
  try {
    const { data: ymlFileData } = await octokit.repos.getContent({
      owner,
      repo,
      path: ymlFilePath
    });
    return Buffer.from(ymlFileData.content, 'base64').toString('utf-8');
  } catch (error) {
    console.error(`Error fetching YAML file content: ${error.message}`);
  }
}

async function getRepoWebhooks(owner, repo) {
  try {
    const { data: webhooks } = await octokit.repos.listWebhooks({
      owner,
      repo
    });
    return webhooks.filter(webhook =>webhook.active==true).map(webhook => webhook.config.url);
  } catch (error) {
    console.error(`Error fetching repository webhooks: ${error.message}`);
  }
}

export async function getRepoInfo(owner, repo,extentd=false) {
    const repoData = await getRepoDetails(owner, repo);
    if(!extentd){
      return repoData;
    }

    const contents = await getRepoContents(owner, repo);

   //todo fix  yml dont work for repo a and c
    const ymlFiles=await searchYamlFiles(owner, repo);

    let ymlContent = '';

    if (ymlFiles.length > 0) {
      ymlContent = await getYmlFileContent(owner, repo, ymlFiles[0]);
    }

    const webhooks = await getRepoWebhooks(owner, repo);
    return { repoData, contents, ymlContent, webhooks };
   

}

// if main
if (process.argv[2] === "main") {
  getRepoInfo("tal568", "repoB");}

