import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xFd323620A5D9FB277b05F8bA13c5176F311cf10A";

const CONTRACT_ABI = [
  "function registrar() public view returns (address)",
  "function registerParcel(uint256 _id, string memory _locationRef, uint256 _area, address _owner) public",
  "function requestTransfer(uint256 _id, address _buyer) public",
  "function approveTransfer(uint256 _id) public",
  "function getOwnershipHistory(uint256 _id) public view returns (address[] memory)",
  "function getAllParcelIds() public view returns (uint256[] memory)",
  "function getPendingRequest(uint256 _id) public view returns (address proposedBuyer, bool exists)",
  "function parcels(uint256) public view returns (uint256 id, string locationRef, uint256 area, address currentOwner, bool exists)",
  "event ParcelRegistered(uint256 indexed parcelId, address indexed owner)",
  "event TransferRequested(uint256 indexed parcelId, address indexed requester, address indexed proposedBuyer)",
  "event OwnershipTransferred(uint256 indexed parcelId, address indexed oldOwner, address indexed newOwner)",
];

export const getContractInstance = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    throw new Error("MetaMask is required");
  }

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

export const getCurrentAddress = async () => {
  if (!window.ethereum) return null;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.getAddress();
};
