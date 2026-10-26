import React, { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [connectedAccount, setConnectedAccount] = useState("0x20351a5908640237Dd66CE61E477dAEb8688c94C");

  // Helper function to truncate long wallet addresses cleanly
  const truncateAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "Not Connected";

  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="app-navbar">
        <div className="brand">
         
          <span className="brand-title">Blockchain Land Registry</span>
        </div>

        <div className="wallet-pill">
          <span className="status-dot"></span>
          <span>Wallet:</span>
          <span className="wallet-address">{truncateAddress(connectedAccount)}</span>
        </div>
      </nav>

      {/* Main Dashboard Area */}
      <main className="main-container">
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "registrar" ? "active" : ""}`}
            onClick={() => setActiveTab("registrar")}
          >
            Registrar
          </button>
          <button
            className={`tab-button ${activeTab === "owner" ? "active" : ""}`}
            onClick={() => setActiveTab("owner")}
          >
            Owner
          </button>
          <button
            className={`tab-button ${activeTab === "verifier" ? "active" : ""}`}
            onClick={() => setActiveTab("verifier")}
          >
            Public Verifier
          </button>
        </div>

        {/* Tab Content Cards */}
        {activeTab === "registrar" && (
          <div className="card">
            <h2 className="card-title">Register New Parcel</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Parcel ID</label>
                  <input className="input-control" type="text" placeholder="e.g. 101" />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Reference</label>
                  <input className="input-control" type="text" placeholder="e.g. Block A, Sector 4" />
                </div>

                <div className="form-group">
                  <label className="form-label">Area (sq. ft.)</label>
                  <input className="input-control" type="number" placeholder="e.g. 2400" />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Wallet Address</label>
                  <input className="input-control" type="text" placeholder="0x..." />
                </div>
              </div>

              <button className="btn-primary" type="submit">
                Register Parcel
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
