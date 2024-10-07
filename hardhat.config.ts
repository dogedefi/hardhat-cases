import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ethers";

import "./tasks/accounts";

const INFURA_API_KEY = "5f8cbc2e323b4613b0cab671d1c31ee3";
const SEPOLIA_PRIVATE_KEY =
  "8f822b9cddf70b2a56c4d7fa9e7ef67d51131677d7883e62a4d64a6c410e8ff2"; // 0x3211B38F7c86a4423D4abAb64f5f936BD0938b26
const ETHERSCAN_API_KEY = "JUQT9YTU67X559FCMB5ZETMP9CHMP62CK3";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://linea-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    holesky: {
      url: `https://holesky.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      holesky: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
