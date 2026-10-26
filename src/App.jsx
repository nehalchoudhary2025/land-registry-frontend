import React, { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  const account = "0x20351a5908640237Dd66CE61E477dAEb8688c94C";

  return (
    <div className="app-wrapper">
      {/* Header Bar */}
      <nav className="app-navbar">
        <div className="brand-title">🏛️ Blockchain Land Registry</div>
        <div className="wallet-badge">
          Wallet: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Not Connected"}
        </div>
      </nav>

      {/* Main Area */}
      <div className="container">
        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "registrar" ? "active" : ""}`}
            onClick={() => setActiveTab("registrar")}
          >
            Registrar
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "owner" ? "active" : ""}`}
            onClick={() => setActiveTab("owner")}
          >
            Owner
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "verifier" ? "active" : ""}`}
            onClick={() => setActiveTab("verifier")}
          >
            Public Verifier
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "registrar" && (
          <div className="card">
            <h2>Register New Parcel</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Parcel ID</label>
                <input className="input-field" type="text" placeholder="e.g., 101" />
              </div>

              <div className="form-group">
                <label>Location Reference</label>
                <input className="input-field" type="text" placeholder="e.g., Block A, Sector 4" />
              </div>

              <div className="form-group">
                <label>Area (sq. ft.)</label>
                <input className="input-field" type="number" placeholder="e.g., 2400" />
              </div>

              <div className="form-group">
                <label>Owner Wallet Address</label>
                <input className="input-field" type="text" placeholder="0x..." />
              </div>

              <button className="submit-btn" type="submit">
                Register Parcel
              </button>
            </form>
          </div>
        )}

        {activeTab === "owner" && (
          <div className="card">
            <h2>Owner Actions</h2>
            <p>Owner features and land management options go here.</p>
          </div>
        )}

        {activeTab === "verifier" && (
          <div className="card">
            <h2>Public Verifier</h2>
            <p>Public lookup and land record verification options go here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
