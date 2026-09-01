import React, { useState, useEffect } from "react";
import { getAllParcelIds, getParcelDetails, requestTransfer } from "../mockContract";

export default function OwnerView({ activeAccount }) {
  const [ownedParcels, setOwnedParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchOwnedParcels = async () => {
    try {
      const ids = await getAllParcelIds();
      const myParcels = [];
      for (let id of ids) {
        const details = await getParcelDetails(id);
        if (details && details.owner.toLowerCase() === activeAccount.toLowerCase()) {
          myParcels.push(details);
        }
      }
      setOwnedParcels(myParcels);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOwnedParcels();
  }, [activeAccount]);

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      await requestTransfer(selectedParcelId, buyerAddress, activeAccount);
      setStatusMsg({ type: "success", text: `Transfer requested for ${selectedParcelId}` });
      setSelectedParcelId(""); setBuyerAddress("");
      fetchOwnedParcels();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "20px" }}>
      <h2>Citizen / Owner Portal</h2>
      {statusMsg && (
        <div style={{ color: statusMsg.type === "error" ? "red" : "green", marginBottom: "10px" }}>
          {statusMsg.text}
        </div>
      )}

      <h3>My Owned Parcels</h3>
      {ownedParcels.length === 0 ? <p>You currently do not own any registered parcels.</p> : (
        <ul>
          {ownedParcels.map((p) => (
            <li key={p.id}>
              <strong>{p.id}</strong> - {p.locationRef} ({p.area} sq ft)
              {p.pendingTransfer && <span style={{ color: "orange" }}> [Transfer Pending to {p.pendingTransfer.proposedBuyer}]</span>}
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>Request Ownership Transfer</h3>
      <form onSubmit={handleRequestTransfer} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        <input placeholder="Parcel ID" value={selectedParcelId} onChange={(e) => setSelectedParcelId(e.target.value)} required />
        <input placeholder="New Buyer Address (0x...)" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Transfer Request"}</button>
      </form>
    </div>
  );
}