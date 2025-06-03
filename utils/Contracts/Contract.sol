// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommunitySystem {
    struct Community {
        string name;
        address[] members;
        uint[] postIds;
    }

    struct Post {
        string title;
        string message;
        string image;
        address creator;
        uint256 createdAt;
        address[] upvotes;
        address[] downvotes;
    }

    Community[] public communities;
    Post[] public allPosts;
    mapping(uint => uint[]) public communityPosts;

    event CommunityCreated(uint communityId, string name, address creator);
    event MemberJoined(uint communityId, address member);
    event PostCreated(uint communityId, uint postId, address creator);
    event Voted(uint communityId, uint postId, address voter, bool isUpvote);

    // Community Functions
    function createCommunity(string memory _name) public {
        uint communityId = communities.length;
        communities.push(
            Community({
                name: _name,
                members: new address[](0),
                postIds: new uint[](0)
            })
        );
        communities[communityId].members.push(msg.sender);
        emit CommunityCreated(communityId, _name, msg.sender);
    }

    function joinCommunity(uint _communityId) public {
        require(_communityId < communities.length, "Invalid community ID");
        Community storage community = communities[_communityId];

        for (uint i = 0; i < community.members.length; i++) {
            if (community.members[i] == msg.sender) {
                revert("Already a member");
            }
        }
        community.members.push(msg.sender);
        emit MemberJoined(_communityId, msg.sender);
    }

    // Post Functions
    function createPost(
        uint _communityId,
        string memory _title,
        string memory _message,
        string memory _image
    ) public {
        require(_communityId < communities.length, "Invalid community ID");
        Community storage community = communities[_communityId];

        bool isMember = false;
        for (uint i = 0; i < community.members.length; i++) {
            if (community.members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Only members can post");

        uint postId = allPosts.length;
        allPosts.push(
            Post({
                title: _title,
                message: _message,
                image: _image,
                creator: msg.sender,
                createdAt: block.timestamp,
                upvotes: new address[](0),
                downvotes: new address[](0)
            })
        );

        communityPosts[_communityId].push(postId);
        community.postIds.push(postId);
        emit PostCreated(_communityId, postId, msg.sender);
    }

    function vote(uint _communityId, uint _postId, bool _isUpvote) public {
        require(_communityId < communities.length, "Invalid community ID");
        require(_postId < allPosts.length, "Invalid post ID");

        Post storage post = allPosts[_postId];
        address[] storage votes = _isUpvote ? post.upvotes : post.downvotes;

        for (uint i = 0; i < votes.length; i++) {
            if (votes[i] == msg.sender) {
                revert(_isUpvote ? "Already upvoted" : "Already downvoted");
            }
        }

        votes.push(msg.sender);
        emit Voted(_communityId, _postId, msg.sender, _isUpvote);
    }

    function getAllCommunitiesWithMemberCount()
        public
        view
        returns (string[] memory names, uint[] memory memberCounts)
    {
        names = new string[](communities.length);
        memberCounts = new uint[](communities.length);

        for (uint i = 0; i < communities.length; i++) {
            names[i] = communities[i].name;
            memberCounts[i] = communities[i].members.length;
        }
    }

    function getCommunityMembers(
        uint _communityId
    )
        public
        view
        returns (string memory communityName, address[] memory members)
    {
        require(_communityId < communities.length, "Invalid community ID");
        Community storage community = communities[_communityId];
        return (community.name, community.members);
    }

    function getPost(
        uint _postId
    )
        public
        view
        returns (
            string memory title,
            string memory message,
            string memory image,
            address creator,
            uint256 createdAt,
            uint upvotesCount,
            uint downvotesCount
        )
    {
        require(_postId < allPosts.length, "Invalid post ID");
        Post storage post = allPosts[_postId];
        return (
            post.title,
            post.message,
            post.image,
            post.creator,
            post.createdAt,
            post.upvotes.length,
            post.downvotes.length
        );
    }

    function getCommunityPosts(
        uint _communityId
    ) public view returns (uint[] memory) {
        require(_communityId < communities.length, "Invalid community ID");
        return communityPosts[_communityId];
    }
}
