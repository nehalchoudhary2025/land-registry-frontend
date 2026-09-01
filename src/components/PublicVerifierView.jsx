import React, { useState } from "react";
import { getOwnershipHistory, getParcelDetails } from "../mockContract";

export default function PublicVerifierView() {
  const [searchId, setSearchId] = useState("");
  const [history, setHistory] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    setHistory(null);
    setDetails(null);

    try {
      const hist = await getOwnershipHistory(searchId);
      const det = await getParcelDetails(searchId);
      setHistory(hist);
      setDetails(det);
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px" }}>
      <h2>Public Land Verifier</h2>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", maxWidth: "400px", marginBottom: "16px" }}>
        <input 
          placeholder="Enter Parcel ID (e.g., PARCEL-001)" 
          value={searchId} 
          onChange={(e) => setSearchId(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>{loading ? "Searching..." : "Verify Parcel"}</button>
      </form>

      {statusMsg && <div style={{ color: "red" }}>{statusMsg.text}</div>}

      {details && (
        <div>
          <h3>Parcel Details</h3>
          <p><strong>ID:</strong> {details.id}</p>
          <p><strong>Location:</strong> {details.locationRef}</p>
          <p><strong>Area:</strong> {details.area} sq ft</p>
          <p><strong>Current Owner:</strong> {details.owner}</p>

          <h4>Ownership History Sequence</h4>
          <ol>
            {history.map((addr, idx) => (
              <li key={idx}>
                {addr} {idx === history.length - 1 ? "(Current Owner)" : ""}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}