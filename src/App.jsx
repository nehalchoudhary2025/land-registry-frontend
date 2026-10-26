import React, { useState, useEffect } from "react";
import { getCurrentAddress } from "./contractInstance";
import RegistrarView from "./components/RegistrarView";
import OwnerView from "./components/OwnerView";
import PublicVerifierView from "./components/PublicVerifierView";
import "./App.css";

const TABS = [
  { key: "registrar", label: "Registrar" },
  { key: "owner", label: "Owner" },
  { key: "verifier", label: "Public Verifier" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [connectedAddress, setConnectedAddress] = useState(null);

  useEffect(() => {
    getCurrentAddress().then(setConnectedAddress).catch(() => {});
  }, []);

  const short = (a) => (a ? `${a.slice(0, 6)}...${a.slice(-4)}` : "Not connected");

  return (
    <div>
      <nav className="app-navbar">
        <div className="brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-title">Blockchain Land Registry</span>
        </div>
        <div className="wallet-pill">
          <span className="status-dot" style={connectedAddress ? {} : { background: "#94a3b8" }}></span>
          <span>Wallet:</span>
          <span className="wallet-address" title={connectedAddress || ""}>{short(connectedAddress)}</span>
        </div>
      </nav>

      <main className="main-container">
        <div className="tab-navigation">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab-button ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "registrar" && <RegistrarView />}
        {activeTab === "owner" && <OwnerView />}
        {activeTab === "verifier" && <PublicVerifierView />}
      </main>
    </div>
  );
}
