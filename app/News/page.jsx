"use client";
import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/header";
import learnSphere from "../../assets/logo.png";
import { VscVerifiedFilled } from "react-icons/vsc";
import { FiX, FiSearch } from "react-icons/fi";
import Image from "next/image";
import BgImage from "../../assets/Bg.jpg";
import {
  getAllCommunities,
  getCommunityPosts,
  getPostDetails,
} from "../../utils/contractintegration/Contract";

function formatPollTime(timestamp) {
  const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} [${hours}:${minutes}]`;
}

const News = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [polls, setPolls] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const pollsEndRef = useRef(null);

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    pollsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [polls]);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoadingCommunities(true);
      try {
        const [names, memberCounts] = await getAllCommunities();
        const fetchedCommunities = names.map((name, index) => ({
          _id: index.toString(),
          name,
          memberCount: memberCounts[index].toNumber(),
        }));
        setCommunities(fetchedCommunities);
        if (fetchedCommunities.length > 0) {
          handleCommunitySelect(fetchedCommunities[0]);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(err.message);
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchCommunities();
  }, []);

  const fetchCommunityPolls = async (communityId) => {
    if (!communityId) return;

    setLoadingPolls(true);
    setError(null);

    try {
      const postIds = await getCommunityPosts(parseInt(communityId));
      const posts = await Promise.all(
        postIds.map(async (postId) => {
          const post = await getPostDetails(postId);
          return {
            id: postId.toString(),
            time: formatPollTime(post.createdAt),
            pollTitle: post.title,
            pollDescription: post.message,
            pollImage: post.image,
            pollVotes: {
              true: post.upvotesCount.toNumber(),
              false: post.downvotesCount.toNumber(),
            },
          };
        })
      );
      setPolls(posts);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError(err.message);
    } finally {
      setLoadingPolls(false);
    }
  };

  const handleCommunitySelect = (community) => {
    setSelectedCommunity(community);
    fetchCommunityPolls(community._id);
    setError(null);
  };

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
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 text-lg font-semibold">
              Communities
            </h3>
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
                    className={`flex items-center space-x-3 p-2 rounded-xl hover:ring-2 hover:ring-green-500 transition cursor-pointer ${
                      selectedCommunity &&
                      selectedCommunity._id === community._id
                        ? "bg-gray-600"
                        : "bg-gray-700"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center overflow-hidden">
                      <span className="text-lg">
                        {community.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium line-clamp-1">
                        {community.name}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {community.memberCount} members
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-center text-gray-400 py-4">
                  No communities found matching "{searchQuery}"
                </li>
              )}
            </ul>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full border border-gray-950 border-x-8">
          <header className="hidden md:flex px-6 py-4 justify-center items-center space-x-2 border-b border-gray-700 bg-white/10 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <Image src={learnSphere} alt="Learn Sphere" className="w-40" />
            </div>
            {selectedCommunity && (
              <div>
                <div className="flex justify-start items-center gap-1">
                  <h2 className="text-sm">Community</h2>
                  <VscVerifiedFilled className="text-sky-700" />
                </div>
                <h2 className="text-sm text-gray-400">
                  {selectedCommunity.name}
                </h2>
              </div>
            )}
          </header>

          {error && (
            <div className="bg-red-900 text-white p-2 text-center text-sm">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <div
              className={`h-full p-4 md:p-6 overflow-y-auto bg-transparent`}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {loadingPolls ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="space-y-6 [&::-webkit-scrollbar]:hidden">
                  {polls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No polls yet in this community</p>
                    </div>
                  ) : (
                    polls.map((poll) => {
                      return (
                        <div
                          key={poll.id}
                          className="rounded-lg p-4 max-w-xs mx-auto bg-white/10 backdrop-blur-md border-white/10 text-gray-200 relative"
                        >
                          {poll.pollImage && (
                            <div className="mb-3">
                              <img
                                src={poll.pollImage}
                                alt="Poll"
                                className="w-xs h-auto rounded-lg"
                              />
                              <h3 className="text-lg font-medium mb-2">
                                {poll.pollTitle}
                              </h3>
                            </div>
                          )}
                          <p className="text-sm mb-4">{poll.pollDescription}</p>
                          <div className="flex justify-between text-xs">
                            <div className="text-gray-400">{poll.time}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={pollsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;