import hre from "hardhat";
import { expect } from "chai";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

chai.use(chaiAsPromised);

describe("FriendManager", function () {
  async function deployFriendManagerFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2] = await hre.viem.getWalletClients();

    const friendManager = await hre.viem.deployContract("FriendManager");

    const publicClient = await hre.viem.getPublicClient();

    return {
      friendManager,
      owner,
      user1,
      user2,
      publicClient,
    };
  }

  it("should allow a user to send a friend request", async function () {
    const { friendManager, user1, user2 } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);

    const request = await friendManager.read.friendRequests([
      user1.account.address,
      user2.account.address,
    ]);

    expect(request[0].toLowerCase()).to.equal(
      user1.account.address.toLowerCase()
    );
    expect(request[1].toLowerCase()).to.equal(
      user2.account.address.toLowerCase()
    );
    expect(request[2]).to.be.false;
    expect(request[3]).to.be.false;
  });

  it("should allow a user to accept a friend request", async function () {
    const { friendManager, user1, user2 } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    const friendManagerAsUser2 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user2 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);
    await friendManagerAsUser2.write.acceptFriendRequest([
      user1.account.address,
    ]);

    const request = await friendManager.read.friendRequests([
      user1.account.address,
      user2.account.address,
    ]);
    expect(request[2]).to.be.true; // accepted = true

    const friendsUser1 = await friendManager.read.getFriends([
      user1.account.address,
    ]);
    const friendsUser2 = await friendManager.read.getFriends([
      user2.account.address,
    ]);

    expect(friendsUser1.map((a) => a.toLowerCase())).to.include(
      user2.account.address.toLowerCase()
    );
    expect(friendsUser2.map((a) => a.toLowerCase())).to.include(
      user1.account.address.toLowerCase()
    );
  });

  it("should allow a user to reject a friend request", async function () {
    const { friendManager, user1, user2 } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    const friendManagerAsUser2 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user2 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);
    await friendManagerAsUser2.write.rejectFriendRequest([
      user1.account.address,
    ]);

    const request = await friendManager.read.friendRequests([
      user1.account.address,
      user2.account.address,
    ]);
    expect(request[3]).to.be.true;
  });

  it("should not allow to send a friend request to oneself", async function () {
    const { user1, friendManager } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    await expect(
      friendManagerAsUser1.write.sendFriendRequest([user1.account.address])
    ).to.be.rejectedWith("You cannot send a friend request to yourself.");
  });

  it("should not allow a friend request to be sent multiple times", async function () {
    const { user1, user2, friendManager } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);

    await expect(
      friendManagerAsUser1.write.sendFriendRequest([user2.account.address])
    ).to.be.rejectedWith("Friend request already sent.");
  });

  it("should not allow to accept an already accepted friend request", async function () {
    const { user1, user2, friendManager } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    const friendManagerAsUser2 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user2 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);
    await friendManagerAsUser2.write.acceptFriendRequest([
      user1.account.address,
    ]);

    await expect(
      friendManagerAsUser2.write.acceptFriendRequest([user1.account.address])
    ).to.be.rejectedWith("Friend request already accepted.");
  });

  it("should not allow to reject an already rejected friend request", async function () {
    const { user1, user2, friendManager } = await loadFixture(
      deployFriendManagerFixture
    );

    const friendManagerAsUser1 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user1 } }
    );

    const friendManagerAsUser2 = await hre.viem.getContractAt(
      "FriendManager",
      friendManager.address,
      { client: { wallet: user2 } }
    );

    await friendManagerAsUser1.write.sendFriendRequest([user2.account.address]);
    await friendManagerAsUser2.write.rejectFriendRequest([
      user1.account.address,
    ]);

    await expect(
      friendManagerAsUser2.write.rejectFriendRequest([user1.account.address])
    ).to.be.rejectedWith("Friend request already rejected.");
  });
});
