import { getRepoInfo} from './github-api-integrasion.js'
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
        return limit(() => getRepoInfo(repo.owner, repo.repo,false));
    });
    
      const result =  await Promise.all(promises);
      const formattedResult=result.map(repo=>{
        return {repositoryName:repo.name,repositorySize:repo.size,repositoryOwner:repo.owner.login} })
    console.log(formattedResult)
    return formattedResult
  }
        

