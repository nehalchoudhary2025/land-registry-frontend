import React, { useState } from "react";
import { getContractInstance } from "./contractInstance";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  const [connectedAccount, setConnectedAccount] = useState("0x20351a5908640237Dd66CE61E477dAEb8688c94C");

  // Form input states
  const [parcelId, setParcelId] = useState("");
  const [locationRef, setLocationRef] = useState("");
  const [area, setArea] = useState("");
  const [ownerWallet, setOwnerWallet] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper function to truncate long wallet addresses cleanly
  const truncateAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "Not Connected";

  // Handle register parcel submission via MetaMask & Smart Contract
  const handleRegisterParcel = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Get contract instance connected to MetaMask signer
      const contract = await getContractInstance();

      // Call the smart contract function
      const tx = await contract.registerParcel(
        parcelId,
        locationRef,
        area,
        ownerWallet
      );

      console.log("Transaction sent:", tx.hash);
      alert("Transaction submitted! Waiting for confirmation...");

      await tx.wait();
      alert("Parcel registered successfully!");

      // Clear form after success
      setParcelId("");
      setLocationRef("");
      setArea("");
      setOwnerWallet("");

    } catch (error) {
      console.error("Error registering parcel:", error);
      alert("Transaction failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

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
            type="button"
            className={`tab-button ${activeTab === "registrar" ? "active" : ""}`}
            onClick={() => setActiveTab("registrar")}
          >
            Registrar
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === "owner" ? "active" : ""}`}
            onClick={() => setActiveTab("owner")}
          >
            Owner
          </button>
          <button
            type="button"
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
            <form onSubmit={handleRegisterParcel}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Parcel ID</label>
                  <input 
                    className="input-control" 
                    type="text" 
                    placeholder="e.g. 101" 
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location Reference</label>
                  <input 
                    className="input-control" 
                    type="text" 
                    placeholder="e.g. Block A, Sector 4" 
                    value={locationRef}
                    onChange={(e) => setLocationRef(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Area (sq. ft.)</label>
                  <input 
                    className="input-control" 
                    type="number" 
                    placeholder="e.g. 2400" 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner Wallet Address</label>
                  <input 
                    className="input-control" 
                    type="text" 
                    placeholder="0x..." 
                    value={ownerWallet}
                    onChange={(e) => setOwnerWallet(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Processing..." : "Register Parcel"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "owner" && (
          <div className="card">
            <h2 className="card-title">Owner Actions</h2>
            <p>Manage land transfers and requests here.</p>
          </div>
        )}

        {activeTab === "verifier" && (
          <div className="card">
            <h2 className="card-title">Public Verifier</h2>
            <p>Verify parcel records and history transparently.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
