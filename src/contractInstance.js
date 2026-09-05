import { ethers } from "ethers";

// Paste your deployed contract address from Remix here
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

// ABI defined directly as an array so you don't need to import any JSON files
const CONTRACT_ABI = [
  "function registerParcel(uint256 _id, string memory _location, uint256 _area, address _owner) public",
  "function requestTransfer(uint256 _id, address _newOwner) public",
  "function approveTransfer(uint256 _id) public",
  "function getParcel(uint256 _id) public view returns (uint256, string memory, uint256, address, address, bool)"
];

export const getContractInstance = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    throw new Error("MetaMask is required");
  }

  // Switch network to Sepolia automatically
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  } catch (err) {
    console.warn("Network switch notice:", err.message);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};