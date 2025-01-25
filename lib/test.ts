import { defineChain } from "viem";

const openCampusChain = defineChain({
  id: 656476,
  network: "Open Campus Codex",
  name: "Open Campus Codex",
  nativeCurrency: {
    name: "EDU",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
  },
  blockExplorers: {
    default: {
      name: "Block Scout",
      url: "https://opencampus-codex.blockscout.com/",
    },
  },
  contracts: {},
  testnet: true,
});

export default openCampusChain;
