import { ethers } from "ethers";

const communityContractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "communityId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "CommunityCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "communityId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "name": "MemberJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "communityId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "name": "PostCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "communityId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "postId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isUpvote",
        "type": "bool"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allPosts",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "communities",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "communityPosts",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "createCommunity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_communityId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_image",
        "type": "string"
      }
    ],
    "name": "createPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCommunitiesWithMemberCount",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "names",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "memberCounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_communityId",
        "type": "uint256"
      }
    ],
    "name": "getCommunityMembers",
    "outputs": [
      {
        "internalType": "string",
        "name": "communityName",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "members",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_communityId",
        "type": "uint256"
      }
    ],
    "name": "getCommunityPosts",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_postId",
        "type": "uint256"
      }
    ],
    "name": "getPost",
    "outputs": [
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "upvotesCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "downvotesCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_communityId",
        "type": "uint256"
      }
    ],
    "name": "joinCommunity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_communityId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_postId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_isUpvote",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const communityContractAddress = "0x57FD9d99B12B4a0e12726596036E64711A7eDCF8";

const getCommunityContract = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(
    communityContractAddress,
    communityContractABI,
    signer
  );
};

// Community Functions
export const createCommunity = async (name) => {
  const contract = getCommunityContract();
  const tx = await contract.createCommunity(name);
  await tx.wait();
  return tx;
};

export const joinCommunity = async (communityId) => {
  const contract = getCommunityContract();
  const tx = await contract.joinCommunity(communityId);
  await tx.wait();
  return tx;
};

// Post Functions
export const createPost = async (communityId, title, message, image) => {
  const contract = getCommunityContract();
  const tx = await contract.createPost(communityId, title, message, image);
  await tx.wait();
  return tx;
};

export const votePost = async (communityId, postId, isUpvote) => {
  const contract = getCommunityContract();
  const tx = await contract.vote(communityId, postId, isUpvote);
  await tx.wait();
  return tx;
};

// View Functions
export const getAllCommunities = async () => {
  const contract = getCommunityContract();
  return await contract.getAllCommunitiesWithMemberCount();
};

export const getCommunityMembers = async (communityId) => {
  const contract = getCommunityContract();
  return await contract.getCommunityMembers(communityId);
};

export const getCommunityPosts = async (communityId) => {
  const contract = getCommunityContract();
  return await contract.getCommunityPosts(communityId);
};

export const getPostDetails = async (postId) => {
  const contract = getCommunityContract();
  return await contract.getPost(postId);
};

// Event Listeners
export const listenForCommunityCreated = (callback) => {
  const contract = getCommunityContract();
  contract.on("CommunityCreated", callback);
  return () => contract.off("CommunityCreated", callback);
};

export const listenForMemberJoined = (callback) => {
  const contract = getCommunityContract();
  contract.on("MemberJoined", callback);
  return () => contract.off("MemberJoined", callback);
};

export const listenForPostCreated = (callback) => {
  const contract = getCommunityContract();
  contract.on("PostCreated", callback);
  return () => contract.off("PostCreated", callback);
};

export const listenForVoted = (callback) => {
  const contract = getCommunityContract();
  contract.on("Voted", callback);
  return () => contract.off("Voted", callback);
};