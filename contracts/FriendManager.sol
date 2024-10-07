// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FriendManager {
    struct FriendRequest {
        address from;
        address to;
        bool accepted;
        bool rejected;
    }

    mapping(address => mapping(address => FriendRequest)) public friendRequests;
    mapping(address => address[]) public friends;

    event FriendRequestSent(address indexed from, address indexed to);
    event FriendRequestAccepted(address indexed from, address indexed to);
    event FriendRequestRejected(address indexed from, address indexed to);

    function sendFriendRequest(address _to) public {
        require(
            _to != msg.sender,
            "You cannot send a friend request to yourself."
        );

        require(
            friendRequests[msg.sender][_to].from == address(0),
            "Friend request already sent."
        );

        friendRequests[msg.sender][_to] = FriendRequest(
            msg.sender,
            _to,
            false,
            false
        );

        emit FriendRequestSent(msg.sender, _to);
    }

    function acceptFriendRequest(address _from) public {
        FriendRequest storage request = friendRequests[_from][msg.sender];

        require(
            request.from != address(0),
            "No friend request from this address."
        );

        require(!request.accepted, "Friend request already accepted.");

        require(!request.rejected, "Friend request already rejected.");

        request.accepted = true;
        friends[msg.sender].push(_from);
        friends[_from].push(msg.sender);

        emit FriendRequestAccepted(_from, msg.sender);
    }

    function rejectFriendRequest(address _from) public {
        FriendRequest storage request = friendRequests[_from][msg.sender];

        require(
            request.from != address(0),
            "No friend request from this address."
        );

        require(!request.accepted, "Friend request already accepted.");

        require(!request.rejected, "Friend request already rejected.");

        request.rejected = true;

        emit FriendRequestRejected(_from, msg.sender);
    }

    function getFriends(address _user) public view returns (address[] memory) {
        return friends[_user];
    }
}
