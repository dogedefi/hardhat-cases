import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FriendManagerModule = buildModule("FriendManagerModule", (m) => {
  const friendManager = m.contract("FriendManager");

  return { friendManager };
});

export default FriendManagerModule;
