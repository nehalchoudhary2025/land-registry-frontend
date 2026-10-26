import React, { useState, useEffect } from "react";
import { getCurrentAddress } from "./contractInstance";
import RegistrarView from "./components/RegistrarView";
import OwnerView from "./components/OwnerView";
import PublicVerifierView from "./components/PublicVerifierView";

export default function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [connectedAddress, setConnectedAddress] = useState(null);

  useEffect(() => {
    getCurrentAddress().then(setConnectedAddress).catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🏛️ Blockchain Land Registry</h1>
      </header>

      <div className="wallet-bar">
        <label>Connected wallet</label>
        <span style={{ fontWeight: 600, wordBreak: "break-all" }}>
          {connectedAddress || "Not connected"}
        </span>
      </div>

      <div className="nav-tabs">
        <button
          className={activeTab === "registrar" ? "active" : ""}
          onClick={() => setActiveTab("registrar")}
        >
          Registrar
        </button>
        <button
          className={activeTab === "owner" ? "active" : ""}
          onClick={() => setActiveTab("owner")}
        >
          Owner
        </button>
        <button
          className={activeTab === "verifier" ? "active" : ""}
          onClick={() => setActiveTab("verifier")}
        >
          Public Verifier
        </button>
      </div>

      {activeTab === "registrar" && <RegistrarView />}
      {activeTab === "owner" && <OwnerView />}
      {activeTab === "verifier" && <PublicVerifierView />}
    </div>
  );
}
