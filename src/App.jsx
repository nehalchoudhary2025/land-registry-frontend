import React, { useState, useEffect } from "react";
import { getContractInstance } from "./contractInstance";

export default function App() {
  // Form State
  const [parcelId, setParcelId] = useState("");
  const [locationRef, setLocationRef] = useState("");
  const [area, setArea] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  
  // Dashboard Data
  const [allParcels, setAllParcels] = useState([]);

  // Fetch registered parcels from Blockchain
  const loadParcels = async () => {
    try {
      const contract = await getContractInstance();
      const ids = await contract.getAllParcelIds();

      const details = await Promise.all(
        ids.map(async (id) => {
          const parcel = await contract.parcels(id);
          return {
            id: parcel.id.toString(),
            locationRef: parcel.locationRef,
            area: parcel.area.toString(),
            currentOwner: parcel.currentOwner,
          };
        })
      );
      setAllParcels(details);
    } catch (err) {
      console.error("Error fetching parcels:", err);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  // 1. Registrar Action: Register Parcel
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const contract = await getContractInstance();
      const tx = await contract.registerParcel(
        Number(parcelId),
        locationRef,
        Number(area),
        ownerAddress
      );
      await tx.wait(); // Wait for transaction confirmation
      alert("Parcel successfully registered on-chain!");
      loadParcels();
    } catch (err) {
      alert("Registration failed: " + (err.reason || err.message));
    }
  };

  // 2. Owner Action: Request Transfer
  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    try {
      const contract = await getContractInstance();
      const tx = await contract.requestTransfer(Number(parcelId), buyerAddress);
      await tx.wait();
      alert("Transfer request submitted!");
    } catch (err) {
      alert("Transfer request failed: " + (err.reason || err.message));
    }
  };

  // 3. Registrar Action: Approve Transfer
  const handleApproveTransfer = async (idToApprove) => {
    try {
      const contract = await getContractInstance();
      const tx = await contract.approveTransfer(Number(idToApprove));
      await tx.wait();
      alert("Transfer approved!");
      loadParcels();
    } catch (err) {
      alert("Approval failed: " + (err.reason || err.message));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Blockchain Land Registry</h1>

      {/* Register Form */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Register New Parcel (Registrar Only)</h2>
        <form onSubmit={handleRegister}>
          <input type="number" placeholder="Parcel ID (e.g., 1)" value={parcelId} onChange={(e) => setParcelId(e.target.value)} required />
          <input type="text" placeholder="Location Ref" value={locationRef} onChange={(e) => setLocationRef(e.target.value)} required />
          <input type="number" placeholder="Area (sq ft)" value={area} onChange={(e) => setArea(e.target.value)} required />
          <input type="text" placeholder="Owner Wallet (0x...)" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} required />
          <button type="submit">Register Parcel</button>
        </form>
      </section>

      {/* Transfer Request Form */}
      <section style={{ marginBottom: "30px" }}>
        <h2>Request Transfer (Current Owner)</h2>
        <form onSubmit={handleRequestTransfer}>
          <input type="number" placeholder="Parcel ID" value={parcelId} onChange={(e) => setParcelId(e.target.value)} required />
          <input type="text" placeholder="Buyer Wallet (0x...)" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} required />
          <button type="submit">Request Transfer</button>
        </form>
      </section>

      {/* Live Blockchain Data */}
      <section>
        <h2>Registered Parcels</h2>
        {allParcels.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <p><strong>ID:</strong> {p.id}</p>
            <p><strong>Location:</strong> {p.locationRef}</p>
            <p><strong>Area:</strong> {p.area} sq ft</p>
            <p><strong>Owner:</strong> {p.currentOwner}</p>
            <button onClick={() => handleApproveTransfer(p.id)}>Approve Transfer</button>
          </div>
        ))}
      </section>
    </div>
  );
}