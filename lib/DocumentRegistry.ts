import { ethers } from "ethers";
import DocumentRegistryABI from "@/lib/contracts/DocumentRegistry.json";
const CONTRACT_ADDRESS = "0x1f57908c893021256d1633106b5351348f45deaa";
export const documentRegistryService = {
  async registerDocument(
    openCampusId: string,
    ipfsUrl: string,
    institution: string
  ) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      DocumentRegistryABI.abi,
      signer
    );

    await contract.registerDocument(openCampusId, ipfsUrl, institution);
  },
};
