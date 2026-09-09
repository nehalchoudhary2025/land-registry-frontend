import React, { useState, useEffect } from "react";
import { getContractInstance } from "../contractInstance";

// Some wallets wrap transactions in a "smart account" delegation layer
// (EIP-7702 / redeemDelegations). When a call reverts inside that wrapper,
// ethers.js's err.reason / err.message can come back garbled or misleading
// rather than the contract's actual revert string. So instead of trusting
// that text, we show one honest, generic message and log the raw error to
// the console for anyone who needs to debug further.
function friendlyError(err) {
  console.error("Raw error (for debugging):", err);
  return "The transaction did not complete successfully. This usually means the connected wallet doesn't have permission for this action, or the parcel ID is invalid. Check the console for technical details.";
}

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

      let txFailed = false;
      try {
        const tx = await contract.registerParcel(idNum, location, Number(area), owner);
        await tx.wait();
      } catch (err) {
        // Don't trust the error text here — some wallets misreport revert
        // reasons. We verify against real chain state below regardless.
        console.warn("Transaction threw (will verify actual chain state):", err);
        txFailed = true;
      }

      // Verify against real chain state — this is the only reliable signal,
      // whether or not the transaction itself appeared to throw.
      const parcel = await contract.parcels(idNum);
      const reallyRegistered =
        parcel.exists === true &&
        parcel.currentOwner.toLowerCase() === owner.toLowerCase();

      if (reallyRegistered) {
        setStatusMsg({ type: "success", text: `Successfully registered parcel #${idNum}.` });
        setId(""); setLocation(""); setArea(""); setOwner("");
      } else if (parcel.exists === true) {
        setStatusMsg({ type: "error", text: `Parcel #${idNum} already exists with a different owner.` });
      } else {
        setStatusMsg({
          type: "error",
          text: "Registration did not take effect. Only the registrar's wallet can register parcels — check you're connected as the registrar.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: friendlyError(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (parcelId, proposedBuyer) => {
    setApprovingId(parcelId);
    setStatusMsg(null);
    try {
      const contract = await getContractInstance();
      const idNum = Number(parcelId);

      try {
        const tx = await contract.approveTransfer(idNum);
        await tx.wait();
      } catch (err) {
        console.warn("Transaction threw (will verify actual chain state):", err);
      }

      const [pending, parcel] = await Promise.all([
        contract.getPendingRequest(idNum),
        contract.parcels(idNum),
      ]);
      const reallyApproved =
        !pending.exists &&
        parcel.currentOwner.toLowerCase() === proposedBuyer.toLowerCase();

      if (reallyApproved) {
        setStatusMsg({ type: "success", text: `Transfer approved for parcel #${parcelId}.` });
        await loadPendingRequests();
      } else {
        setStatusMsg({
          type: "error",
          text: "Approval did not take effect. Only the registrar's wallet can approve transfers.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: friendlyError(err) });
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
                  onClick={() => handleApprove(req.parcelId, req.proposedBuyer)}
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
