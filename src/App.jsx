import React, { useState } from "react";
import RegistrarView from "./components/RegistrarView";
import OwnerView from "./components/OwnerView";
import PublicVerifierView from "./components/PublicVerifierView";
import { MOCK_ROLES } from "./mockContract";

export default function App() {
  const [view, setView] = useState("registrar");
  const [activeAccount, setActiveAccount] = useState(MOCK_ROLES.REGISTRAR);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Blockchain Land Registry </h1>
      
      {/* Account Switcher Simulation */}
      <div style={{ background: "#f0f0f0", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>
        <label><strong>Simulated Wallet Connection: </strong></label>
        <select value={activeAccount} onChange={(e) => setActiveAccount(e.target.value)}>
          <option value={MOCK_ROLES.REGISTRAR}>Registrar ({MOCK_ROLES.REGISTRAR.slice(0,8)}...)</option>
          <option value={MOCK_ROLES.OWNER_1}>Owner 1 ({MOCK_ROLES.OWNER_1.slice(0,8)}...)</option>
          <option value={MOCK_ROLES.BUYER_1}>Buyer 1 ({MOCK_ROLES.BUYER_1.slice(0,8)}...)</option>
        </select>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setView("registrar")}>Registrar View</button>
        <button onClick={() => setView("owner")}>Citizen/Owner View</button>
        <button onClick={() => setView("public")}>Public Verifier View</button>
      </div>

      {/* Active Component */}
      {view === "registrar" && <RegistrarView activeAccount={activeAccount} />}
      {view === "owner" && <OwnerView activeAccount={activeAccount} />}
      {view === "public" && <PublicVerifierView />}
    </div>
  );
}