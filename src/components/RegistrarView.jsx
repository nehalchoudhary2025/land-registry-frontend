import React, { useState, useEffect } from "react";
import { getContractInstance, getCurrentAddress } from "../contractInstance";

export default function RegistrarView() {
  const [id, setId] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [owner, setOwner] = useState("");

  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadPendingRequests = async () => {
    try {
      const contract = await getContractInstance();
      const ids = await contract.getAllParcelIds();
      const pending = [];
      for (const parcelId of ids) {
        const req = await contract.getPendingRequest(parcelId);
        if (req.exists) {
          pending.push({ parcelId: parcelId.toString(), proposedBuyer: req.proposedBuyer });
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
      const contract = await getContractInstance();
      const idNum = Number(id);

      const tx = await contract.registerParcel(idNum, location, Number(area), owner);
      await tx.wait();

      // Verify against real chain state — an outer transaction can succeed
      // while an inner call (e.g. via a smart-account wallet) reverts.
      const parcel = await contract.parcels(idNum);
      if (parcel.currentOwner.toLowerCase() === owner.toLowerCase()) {
        setStatusMsg({ type: "success", text: `Successfully registered parcel #${idNum}.` });
        setId(""); setLocation(""); setArea(""); setOwner("");
      } else {
        setStatusMsg({
          type: "error",
          text: "Transaction submitted, but registration did not take effect. Only the registrar's wallet can register parcels — check you're connected as the registrar.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (parcelId) => {
    setApprovingId(parcelId);
    setStatusMsg(null);
    try {
      const contract = await getContractInstance();
      const tx = await contract.approveTransfer(Number(parcelId));
      await tx.wait();

      const pending = await contract.getPendingRequest(Number(parcelId));
      if (!pending.exists) {
        setStatusMsg({ type: "success", text: `Transfer approved for parcel #${parcelId}.` });
        await loadPendingRequests();
      } else {
        setStatusMsg({
          type: "error",
          text: "Transaction submitted, but the approval did not take effect. Only the registrar's wallet can approve transfers.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: err.reason || err.message });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h2>Register New Parcel</h2>

        {statusMsg && (
          <div className={`status-msg ${statusMsg.type}`}>
            {statusMsg.type === "success" ? "✅" : "⚠️"} {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input placeholder="Parcel ID (e.g., 1)" type="number" value={id}
            onChange={(e) => setId(e.target.value)} required />
          <input placeholder="Location Ref (e.g., Survey-42)" value={location}
            onChange={(e) => setLocation(e.target.value)} required />
          <input placeholder="Area (sq ft)" type="number" value={area}
            onChange={(e) => setArea(e.target.value)} required />
          <input placeholder="Owner Wallet (0x...)" value={owner}
            onChange={(e) => setOwner(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? "Registering…" : "Register Parcel"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Pending Transfer Requests</h2>
        {pendingRequests.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No pending transfers.</p>
        ) : (
          <ul>
            {pendingRequests.map((req) => (
              <li key={req.parcelId}>
                <span>
                  <strong>Parcel #{req.parcelId}</strong> → {req.proposedBuyer}
                </span>
                <button
                  onClick={() => handleApprove(req.parcelId)}
                  disabled={approvingId === req.parcelId}
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  {approvingId === req.parcelId ? "Approving…" : "Approve"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
