import React, { useState } from "react";
import { getContractInstance } from "../contractInstance";

export default function PublicVerifierView() {
  const [searchId, setSearchId] = useState("");
  const [parcel, setParcel] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    setParcel(null);
    setHistory(null);

    try {
      const contract = await getContractInstance();
      const idNum = Number(searchId);

      const parcelData = await contract.parcels(idNum);
      if (!parcelData.exists) {
        setStatusMsg({ type: "error", text: `No parcel found with ID #${idNum}.` });
        return;
      }

      const hist = await contract.getOwnershipHistory(idNum);
      setParcel({
        id: parcelData.id.toString(),
        locationRef: parcelData.locationRef,
        area: parcelData.area.toString(),
        currentOwner: parcelData.currentOwner,
      });
      setHistory(hist);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.reason || err.message || "Lookup failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Public Land Verifier</h2>
      <p className="hint">
        Anyone can look up a parcel's current owner and full ownership history — no wallet permission required, this only reads public blockchain data.
      </p>

      <form onSubmit={handleSearch} className="search-row">
        <input className="input-control" placeholder="Enter Parcel ID (e.g., 1)" value={searchId}
          onChange={(e) => setSearchId(e.target.value)} required />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Verify Parcel"}
        </button>
      </form>

      {statusMsg && (
        <div className={`status-msg ${statusMsg.type}`} style={{ marginTop: 16 }}>
          ⚠️ {statusMsg.text}
        </div>
      )}

      {parcel && (
        <div style={{ marginTop: 20 }}>
          <h3>Parcel Details</h3>
          <ul>
            <li><span>ID</span><span>{parcel.id}</span></li>
            <li><span>Location</span><span>{parcel.locationRef}</span></li>
            <li><span>Area</span><span>{parcel.area} sq ft</span></li>
            <li><span>Current Owner</span><span style={{ wordBreak: "break-all" }}>{parcel.currentOwner}</span></li>
          </ul>

          <h3>Ownership History</h3>
          <ol style={{ listStyle: "decimal", paddingLeft: 20 }}>
            {history.map((addr, idx) => (
              <li key={idx} style={{ background: "none", border: "none", padding: "4px 0", wordBreak: "break-all" }}>
                {addr} {idx === history.length - 1 ? <span className="badge">Current</span> : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
