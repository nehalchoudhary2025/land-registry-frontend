import React, { useState, useEffect } from "react";
import { registerParcel, getAllParcelIds, getPendingRequest, approveTransfer } from "../mockContract";

export default function RegistrarView({ activeAccount }) {
  const [id, setId] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [owner, setOwner] = useState("");
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadPendingRequests = async () => {
    try {
      const ids = await getAllParcelIds();
      const pending = [];
      for (let parcelId of ids) {
        const req = await getPendingRequest(parcelId);
        if (req.exists) {
          pending.push({ parcelId, proposedBuyer: req.proposedBuyer });
        }
      }
      setPendingRequests(pending);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    try {
      await registerParcel(id, location, Number(area), owner, activeAccount);
      setStatusMsg({ type: "success", text: `Successfully registered parcel ${id}!` });
      setId(""); setLocation(""); setArea(""); setOwner("");
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (parcelId) => {
    setLoading(true);
    setStatusMsg(null);
    try {
      await approveTransfer(parcelId, activeAccount);
      setStatusMsg({ type: "success", text: `Transfer approved for ${parcelId}` });
      await loadPendingRequests();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "20px" }}>
      <h2>Registrar Dashboard</h2>
      {statusMsg && (
        <div style={{ color: statusMsg.type === "error" ? "red" : "green", marginBottom: "10px" }}>
          {statusMsg.text}
        </div>
      )}

      <h3>Register New Parcel</h3>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        <input placeholder="Parcel ID (e.g. PARCEL-002)" value={id} onChange={(e) => setId(e.target.value)} required />
        <input placeholder="Location Reference" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input placeholder="Area (sq ft)" type="number" value={area} onChange={(e) => setArea(e.target.value)} required />
        <input placeholder="Owner Address (0x...)" value={owner} onChange={(e) => setOwner(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Processing..." : "Register Parcel"}</button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <h3>Pending Transfer Requests</h3>
      {pendingRequests.length === 0 ? <p>No pending transfers.</p> : (
        <ul>
          {pendingRequests.map((req) => (
            <li key={req.parcelId} style={{ marginBottom: "8px" }}>
              <strong>ID:</strong> {req.parcelId} | <strong>Buyer:</strong> {req.proposedBuyer}{" "}
              <button onClick={() => handleApprove(req.parcelId)} disabled={loading}>
                {loading ? "Approving..." : "Approve Transfer"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}