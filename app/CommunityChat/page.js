"use client";
import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/header";
import learnSphere from '../../assets/logo.png';
import { VscVerifiedFilled } from "react-icons/vsc";
import { FiPlus, FiImage, FiX, FiSearch } from "react-icons/fi";
import Image from 'next/image';
import BgImage from "../../assets/Bg.jpg";
import { useWallet } from "@/context/WalletContext";
import { 
  getAllCommunities, 
  getCommunityMembers, 
  getCommunityPosts, 
  getPostDetails,
  createCommunity,
  joinCommunity,
  createPost,
  votePost
} from "../../utils/contractintegration/Contract";

function formatPollTime(timestamp) {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}-${year} [${hours}:${minutes}]`;
}

const CommunityChat = () => {
  const {
    isConnected,
    connectWallet,
    account
  } = useWallet();

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [polls, setPolls] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [error, setError] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const pollsEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    pollsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [polls]);

  const checkMembership = async (communityId) => {
    try {
      const [, members] = await getCommunityMembers(communityId);
      console.log("Members:", members);
      console.log("Current account:", account);

      const normalizedMembers = members.map(addr => addr.toLowerCase());
      const normalizedAccount = account.toLowerCase();
      
      const isMember = normalizedMembers.includes(normalizedAccount);
      console.log("Is member:", isMember);
      
      setIsMember(isMember);
      return isMember;
    } catch (err) {
      console.error('Error checking membership:', err);
      setIsMember(false);
      return false;
    }
  };

  const fetchCommunityPolls = async (communityId) => {
    if (!communityId) return;

    setLoadingPolls(true);
    setError(null);

    try {
      const postIds = await getCommunityPosts(communityId);
      
      const posts = await Promise.all(
        postIds.map(async (postId) => {
          const post = await getPostDetails(postId);
          return {
            _id: postId.toString(),
            pollTitle: post.title,
            pollDescription: post.message,
            pollImage: post.image,
            createdAt: post.createdAt,
            pollVotes: {
              true: post.upvotesCount.toNumber(),
              false: post.downvotesCount.toNumber()
            },
            creator: post.creator,
            postId: postId
          };
        })
      );

      setPolls(formatPolls(posts));
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError(err.message);
    } finally {
      setLoadingPolls(false);
    }
  };

  const formatPolls = (apiPolls) => {
    if (!apiPolls) return [];

    return apiPolls.map(poll => ({
      id: poll._id,
      time: formatPollTime(poll.createdAt),
      pollTitle: poll.pollTitle,
      pollDescription: poll.pollDescription,
      pollImage: poll.pollImage,
      pollVotes: poll.pollVotes || { true: 0, false: 0 },
      postId: poll.postId
    }));
  };

  const handleCommunitySelect = async (community) => {
    setSelectedCommunity(community);
    await checkMembership(community._id);
    fetchCommunityPolls(community._id);
    setError(null);
  };

  const handleJoinCommunity = async () => {
    if (!selectedCommunity) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      const tx = await joinCommunity(selectedCommunity._id);
      await tx.wait();
      await checkMembership(selectedCommunity._id);
    } catch (err) {
      console.error('Error joining community:', err);
      setError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!communityName.trim()) {
      setError('Please fill in community name');
      return;
    }

    setIsCreatingCommunity(true);
    setError(null);

    try {
      const tx = await createCommunity(communityName);
      await tx.wait();

      const [names, memberCounts] = await getAllCommunities();
      const newCommunities = names.map((name, index) => ({
        _id: index.toString(),
        name,
        memberCount: memberCounts[index].toNumber()
      }));
      
      setCommunities(newCommunities);
      setShowCommunityModal(false);
      setCommunityName("");
      
      // Select the newly created community
      if (newCommunities.length > 0) {
        await handleCommunitySelect(newCommunities[newCommunities.length - 1]);
      }
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err.message);
    } finally {
      setIsCreatingCommunity(false);
    }
  };

  const uploadImageToPinata = async (file) => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          pinata_api_key: "b670445db8b318a6e492",
          pinata_secret_api_key: "7d343880e219ccc78e44c8c8ffd43d62a5fc250d087a809a8f2123aac91c9aed",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      if (result.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      } else {
        throw new Error("IPFS hash not found in response");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollTitle.trim() || !pollDescription.trim()) {
      setError('Please fill in both title and description');
      return;
    }

    setIsCreatingPoll(true);
    setError(null);

    try {
      let imageUrl = "";
      if (selectedImage && fileInputRef.current.files[0]) {
        imageUrl = await uploadImageToPinata(fileInputRef.current.files[0]);
      }

      const tx = await createPost(
        selectedCommunity._id,
        pollTitle,
        pollDescription,
        imageUrl
      );
      await tx.wait();
      
      // Refresh polls
      await fetchCommunityPolls(selectedCommunity._id);
      
      setShowPollModal(false);
      setPollTitle("");
      setPollDescription("");
      setSelectedImage(null);
    } catch (err) {
      console.error('Error creating poll:', err);
      setError(err.message);
    } finally {
      setIsCreatingPoll(false);
    }
  };

  const handleVote = async (postId, vote) => {
    if (!isMember) return;

    setIsVoting(true);
    setError(null);

    try {
      const isUpvote = vote === 'true';
      const tx = await votePost(selectedCommunity._id, postId, isUpvote);
      await tx.wait();
      const updatedPoll = await getPostDetails(postId);
      
      setPolls(prev => prev.map(poll => {
        if (poll.postId === postId) {
          return {
            ...poll,
            pollVotes: {
              true: updatedPoll.upvotesCount.toNumber(),
              false: updatedPoll.downvotesCount.toNumber()
            }
          };
        }
        return poll;
      }));
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.message);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    const loadCommunities = async () => {
      setLoadingCommunities(true);
      setError(null);

      try {
        const [names, memberCounts] = await getAllCommunities();
        const loadedCommunities = names.map((name, index) => ({
          _id: index.toString(),
          name,
          memberCount: memberCounts[index].toNumber()
        }));
        
        setCommunities(loadedCommunities);
        if (loadedCommunities.length > 0) {
          await handleCommunitySelect(loadedCommunities[0]);
          console.log(loadedCommunities);
          
        }
      } catch (err) {
        console.error('Error loading communities:', err);
        setError(err.message);
      } finally {
        setLoadingCommunities(false);
      }
    };
    
    if (isConnected) {
      loadCommunities();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white" >
        <div className="fixed inset-0 -z-10">
          <Image
            src={BgImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-opacity-70"></div>
        </div>
        <div className="w-full absolute top-0">
          <Header />
        </div>
        <div
          className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-md border-white/10"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Wallet Not Connected</h2>
          <p className="mb-6">Please connect your MetaMask wallet to access the community chat.</p>
          <button
            onClick={connectWallet}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (loadingCommunities) {
    return (
      <div className="h-screen flex text-white items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <Image
            src={BgImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-opacity-70"></div>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex bg-gray-900 text-white items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <Image
            src={BgImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-opacity-70"></div>
        </div>
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed inset-0 -z-10">
        <Image
          src={BgImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-opacity-70"></div>
      </div>
      <Header />

      <div className="h-screen flex flex-col md:flex-row text-white">
        <aside
          className={`hidden md:flex w-80 p-4 md:p-6 overflow-y-auto border-l flex-col bg-white/10 backdrop-blur-md border-white/10`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 text-lg font-semibold">Communities</h3>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search communities..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="text-gray-400 hover:text-white" />
              </button>
            )}
          </div>

          <div className="flex flex-col justify-between h-full">
            <ul className="space-y-3 [&::-webkit-scrollbar]:hidden">
              {filteredCommunities.length > 0 ? (
                filteredCommunities.map((community) => (
                  <li
                    key={community._id}
                    onClick={() => handleCommunitySelect(community)}
                    className={`flex items-center space-x-3 p-2 rounded-xl hover:ring-2 hover:ring-green-500 transition cursor-pointer ${selectedCommunity && selectedCommunity._id === community._id
                      ? 'bg-gray-600'
                      : 'bg-gray-700'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center overflow-hidden">
                      <span className="text-lg">{community.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium line-clamp-1">{community.name}</h4>
                      <p className="text-xs text-gray-400">{community.memberCount} members</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-400 py-4">
                  {`No communities found matching "${searchQuery}"`}
                </li>
              )}
            </ul>

            <button
              onClick={() => setShowCommunityModal(true)}
              className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl flex items-center justify-center mt-4"
            >
              <FiPlus className="mr-2" />
              Create Community
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full border border-gray-950 border-x-8">
          <header className="hidden md:flex px-6 py-4 justify-evenly items-center border-b border-gray-700 bg-white/10 backdrop-blur-md">
            <div className="justify-center items-center space-x-2 flex">
              <div className="flex items-center space-x-2">
                <Image src={learnSphere} alt="Learn Sphere" className="w-40" />
              </div>
              {selectedCommunity && (
                <div>
                  <div className="flex justify-start items-center gap-1">
                    <h2 className="text-sm">Community</h2>
                    <VscVerifiedFilled className="text-sky-700" />
                  </div>
                  <h2 className="text-sm text-gray-400">{selectedCommunity.name}</h2>
                </div>
              )}
            </div>
            <button 
              onClick={handleJoinCommunity}
              className={`border ${isMember ? 'bg-gray-600' : 'border-[#344047] hover:bg-[#344047]'} px-6 py-3 rounded-lg transition flex items-center`}
              disabled={isMember || isJoining}
            >
              {isJoining ? (
                <div className="animate-spin rounded-full h-5 w-5  mr-2"></div>
              ) : (
                <FiPlus size={20} className="mr-2" />
              )}
              {isMember ? 'Joined' : 'Join'}
            </button>
          </header>

          {error && (
            <div className="bg-red-900 text-white p-2 text-center text-sm">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <div className={`h-full p-4 md:p-6 overflow-y-auto bg-transparent`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}>
              {loadingPolls ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="space-y-6 [&::-webkit-scrollbar]:hidden">
                  {polls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No polls yet in this community</p>
                      <button
                        onClick={() => setShowPollModal(true)}
                        className={`mt-4 bg-green-500 ${!isMember && 'opacity-50 cursor-not-allowed'} hover:bg-green-600 text-white px-4 py-2 rounded-lg`}
                        disabled={!isMember}
                      >
                        Create First Poll
                      </button>
                    </div>
                  ) : (
                    polls.map((poll) => (
                      <div
                        key={poll.id}
                        className="rounded-lg p-4 max-w-xs mx-auto bg-white/10 backdrop-blur-md border-white/10 text-gray-200"
                      >
                        {poll.pollImage && (
                          <div className="mb-3">
                            <img
                              src={poll.pollImage}
                              alt="Poll"
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-medium mb-2">{poll.pollTitle}</h3>
                        <p className="text-sm mb-4">{poll.pollDescription}</p>
                        <div className="flex justify-between">
                          <button
                            onClick={() => handleVote(poll.postId, 'true')}
                            className={`bg-green-500 ${!isMember && 'opacity-50 cursor-not-allowed'} hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center`}
                            disabled={!isMember || isVoting}
                          >
                            {isVoting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            ) : null}
                            Yes ({poll.pollVotes.true})
                          </button>
                          <button
                            onClick={() => handleVote(poll.postId, 'false')}
                            className={`bg-red-500 ${!isMember && 'opacity-50 cursor-not-allowed'} hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center`}
                            disabled={!isMember || isVoting}
                          >
                            {isVoting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            ) : null}
                            No ({poll.pollVotes.false})
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">{poll.time}</div>
                      </div>
                    ))
                  )}
                  <div ref={pollsEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Poll Creation Button */}
          <div className="p-3 md:p-4 flex justify-center border-t bg-white/10 backdrop-blur-md border-white/10">
            <button
              onClick={() => setShowPollModal(true)}
              className={`bg-green-500 ${!isMember && 'opacity-50 cursor-not-allowed'} hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center`}
              disabled={!isMember}
            >
              <FiPlus size={20} className="mr-2" />
              Create New Poll
            </button>
          </div>
        </div>
      </div>

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 -z-10">
            <Image
              src={BgImage}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute inset-0 bg-opacity-70"></div>
          </div>
          <div className="rounded-lg p-6 w-full max-w-md bg-white/10 backdrop-blur-md border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create a Poll</h3>
              <button
                onClick={() => {
                  setShowPollModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                placeholder="Enter poll title"
                className="w-full text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none border border-white/20 bg-white/5"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={pollDescription}
                onChange={(e) => setPollDescription(e.target.value)}
                placeholder="Enter poll description"
                className="w-full text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none h-24 border border-white/20 bg-white/5"
                maxLength={500}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Image (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center border border-white/20"
              >
                <FiImage className="mr-2" />
                {selectedImage ? 'Change Image' : 'Upload Image'}
              </button>
              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full h-32 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPollModal(false);
                  setError(null);
                }}
                className="hover:bg-gray-600 text-white px-4 py-2 rounded-lg border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={isCreatingPoll}
              >
                {isCreatingPoll ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : null}
                Post Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommunityModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0 -z-10">
            <Image
              src={BgImage}
              alt="Background"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
            <div className="absolute inset-0 bg-opacity-70"></div>
          </div>
          <div className="rounded-lg p-6 w-full max-w-md bg-white/10 backdrop-blur-md border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create a Community</h3>
              <button
                onClick={() => {
                  setShowCommunityModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Community Name</label>
              <input
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="Enter community name"
                className="w-full text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none border border-white/20 bg-white/5"
                maxLength={100}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommunityModal(false);
                  setError(null);
                }}
                className="hover:bg-gray-600 text-white px-4 py-2 rounded-lg border border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                disabled={isCreatingCommunity}
              >
                {isCreatingCommunity ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : null}
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;