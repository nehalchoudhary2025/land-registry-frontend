import React, { useState, useEffect } from "react";
import { getContractInstance, getCurrentAddress } from "../contractInstance";

export default function OwnerView() {
  const [myAddress, setMyAddress] = useState("");
  const [ownedParcels, setOwnedParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchOwnedParcels = async () => {
    try {
      const address = await getCurrentAddress();
      setMyAddress(address);

      const contract = await getContractInstance();
      const ids = await contract.getAllParcelIds();
      const mine = [];
      for (const id of ids) {
        const parcel = await contract.parcels(id);
        if (parcel.currentOwner.toLowerCase() === address.toLowerCase()) {
          const pending = await contract.getPendingRequest(id);
          mine.push({
            id: parcel.id.toString(),
            locationRef: parcel.locationRef,
            area: parcel.area.toString(),
            pendingTransfer: pending.exists ? pending.proposedBuyer : null,
          });
        }
      }
      setOwnedParcels(mine);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOwnedParcels();
  }, []);

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      const contract = await getContractInstance();
      const idNum = Number(selectedParcelId);

      const tx = await contract.requestTransfer(idNum, buyerAddress);
      await tx.wait();

      const pending = await contract.getPendingRequest(idNum);
      if (pending.exists && pending.proposedBuyer.toLowerCase() === buyerAddress.toLowerCase()) {
        setStatusMsg({ type: "success", text: `Transfer requested for parcel #${idNum}.` });
        setSelectedParcelId(""); setBuyerAddress("");
        fetchOwnedParcels();
      } else {
        setStatusMsg({
          type: "error",
          text: "Transaction submitted, but no request was recorded. You must be the current owner of this parcel to request a transfer.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2>My Owned Parcels</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16, wordBreak: "break-all" }}>
          Connected as: {myAddress}
        </p>
        {ownedParcels.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>You currently do not own any registered parcels.</p>
        ) : (
          <ul>
            {ownedParcels.map((p) => (
              <li key={p.id} style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Parcel #{p.id}</strong>
                  {p.pendingTransfer && <span className="badge">Transfer Pending</span>}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {p.locationRef} · {p.area} sq ft
                </div>
                {p.pendingTransfer && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Proposed buyer: {p.pendingTransfer}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Request Ownership Transfer</h2>

        {statusMsg && (
          <div className={`status-msg ${statusMsg.type}`}>
            {statusMsg.type === "success" ? "✅" : "⚠️"} {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleRequestTransfer}>
          <input placeholder="Parcel ID" type="number" value={selectedParcelId}
            onChange={(e) => setSelectedParcelId(e.target.value)} required />
          <input placeholder="Buyer Wallet (0x...)" value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Request Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}
