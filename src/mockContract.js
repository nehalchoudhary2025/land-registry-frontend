// In-memory fake database state
let mockDatabase = {
  parcels: {
    "PARCEL-001": {
      id: "PARCEL-001",
      locationRef: "Sector 5, Block B",
      area: 1200,
      owner: "0x1111111111111111111111111111111111111111",
      history: ["0x1111111111111111111111111111111111111111"],
      pendingTransfer: null // { proposedBuyer: string }
    }
  },
  allIds: ["PARCEL-001"]
};

// Simulated Roles for Mock Execution
export const MOCK_ROLES = {
  REGISTRAR: "0xREGISTRAR00000000000000000000000000000",
  OWNER_1: "0x1111111111111111111111111111111111111111",
  BUYER_1: "0x2222222222222222222222222222222222222222"
};

const simulateDelay = (ms = 1200) => new Promise((res) => setTimeout(res, ms));

// 1. registerParcel(id, locationRef, area, owner)
export const registerParcel = async (id, locationRef, area, owner, callerAddress) => {
  await simulateDelay();
  
  if (callerAddress !== MOCK_ROLES.REGISTRAR) {
    throw new Error("VM Exception: Only the registrar can perform this action");
  }
  if (mockDatabase.parcels[id]) {
    throw new Error("VM Exception: Parcel ID already exists");
  }

  mockDatabase.parcels[id] = {
    id,
    locationRef,
    area,
    owner,
    history: [owner],
    pendingTransfer: null
  };
  mockDatabase.allIds.push(id);

  return { parcelId: id, owner }; // Simulates ParcelRegistered event
};

// 2. requestTransfer(id, buyer)
export const requestTransfer = async (id, buyer, callerAddress) => {
  await simulateDelay();
  const parcel = mockDatabase.parcels[id];

  if (!parcel) throw new Error("VM Exception: Parcel does not exist");
  if (parcel.owner.toLowerCase() !== callerAddress.toLowerCase()) {
    throw new Error("VM Exception: Only the parcel owner can request a transfer");
  }

  parcel.pendingTransfer = { proposedBuyer: buyer };

  return { parcelId: id, requester: callerAddress, proposedBuyer: buyer }; // TransferRequested event
};

// 3. approveTransfer(id)
export const approveTransfer = async (id, callerAddress) => {
  await simulateDelay();
  
  if (callerAddress !== MOCK_ROLES.REGISTRAR) {
    throw new Error("VM Exception: Only the registrar can approve transfers");
  }

  const parcel = mockDatabase.parcels[id];
  if (!parcel || !parcel.pendingTransfer) {
    throw new Error("VM Exception: No pending transfer request found for this parcel");
  }

  const oldOwner = parcel.owner;
  const newOwner = parcel.pendingTransfer.proposedBuyer;

  parcel.owner = newOwner;
  parcel.history.push(newOwner);
  parcel.pendingTransfer = null;

  return { parcelId: id, oldOwner, newOwner }; // OwnershipTransferred event
};

// 4. getOwnershipHistory(id)
export const getOwnershipHistory = async (id) => {
  await simulateDelay(600); // Shorter delay for view/read functions
  const parcel = mockDatabase.parcels[id];
  if (!parcel) throw new Error("VM Exception: Parcel does not exist");
  return [...parcel.history];
};

// 5. getAllParcelIds()
export const getAllParcelIds = async () => {
  await simulateDelay(600);
  return [...mockDatabase.allIds];
};

// 6. getPendingRequest(id)
export const getPendingRequest = async (id) => {
  await simulateDelay(600);
  const parcel = mockDatabase.parcels[id];
  if (!parcel || !parcel.pendingTransfer) {
    return { proposedBuyer: "0x0000000000000000000000000000000000000000", exists: false };
  }
  return { proposedBuyer: parcel.pendingTransfer.proposedBuyer, exists: true };
};

// Helper function for demo UI (to inspect full records easily)
export const getParcelDetails = async (id) => {
  await simulateDelay(400);
  return mockDatabase.parcels[id] || null;
};
