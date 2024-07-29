import { getRepoDetails ,getRepoContents,searchYamlFiles,getYmlFileContent,getRepoWebhooks} from './github-api-integrasion.js'
import pLimit from 'p-limit';

export const  resolvers = {
    Query: {
      repositories: async() =>await getRepostorysDetails(),
      repositorie: async (_, { repositoryName }) => repos.find(repo => repo.repositoryName === repositoryName),
    },
  };


  async function getRepostorysDetails() {
    const limit = pLimit(2);
    
    const repos = [
       {owner:"tal568", repo:"repoA"},
        {owner:"tal568", repo:"repoB"},
        {owner:"tal568", repo:"repoC"},
    ]
    
    let promises = repos.map(repo => {
        return limit(() => fetchGithubRepostorysData(repo.owner, repo.repo,false));
    });
    
      const result =  await Promise.all(promises);
      const formattedResult=result.map(repo=>{
        return {repositoryName:repo.name,repositorySize:repo.size,repositoryOwner:repo.owner.login} })
    console.log(formattedResult)
    return formattedResult
  }
  async function fetchGithubRepostorysData(owner, repo,extentd=false) {
    const repoData = await getRepoDetails(owner, repo);
      return repoData;
   
    }
  async function getRepoAdvanceDetails(owner, repo) {
    const repoData = await getRepoDetails(owner, repo);
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
