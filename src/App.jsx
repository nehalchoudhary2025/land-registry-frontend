import React, { useState } from "react";
import { ethers } from "ethers";
import { contract } from "./contractInstance"; // Adjust path if needed
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("registrar");
  
  // Form input states
  const [parcelId, setParcelId] = useState("");
  const [locationRef, setLocationRef] = useState("");
  const [area, setArea] = useState("");
  const [ownerWallet, setOwnerWallet] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle the registration click & MetaMask transaction
  const handleRegisterParcel = async (e) => {
    e.preventDefault();
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Call your smart contract function
      const tx = await contract.connect(signer).registerParcel(
        parcelId,
        locationRef,
        area,
        ownerWallet
      );

      console.log("Transaction sent:", tx.hash);
      alert("Transaction submitted! Waiting for confirmation...");
      
      await tx.wait();
      alert("Parcel registered successfully!");

    } catch (error) {
      console.error("Error registering parcel:", error);
      alert("Transaction failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header-card">
        <h1 className="header-title">
          <span>🏛️</span> Blockchain Land Registry
        </h1>
        <div className="wallet-info">
          <span>Connected wallet</span>
          <span className="wallet-address">0x20351a5908640237Dd66CE61E477dAEb8688c94C</span>
        </div>

        <div className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === "registrar" ? "active" : ""}`}
            onClick={() => setActiveTab("registrar")}
          >
            Registrar
          </button>
          <button 
            className={`tab-btn ${activeTab === "owner" ? "active" : ""}`}
            onClick={() => setActiveTab("owner")}
          >
            Owner
          </button>
          <button 
            className={`tab-btn ${activeTab === "verifier" ? "active" : ""}`}
            onClick={() => setActiveTab("verifier")}
          >
            Public Verifier
          </button>
        </div>
      </div>

      {activeTab === "registrar" && (
        <div className="card">
          <h2>Register New Parcel</h2>
          <form className="form-group" onSubmit={handleRegisterParcel}>
            <input 
              className="input-field" 
              type="text" 
              placeholder="Parcel ID (e.g., 1)" 
              value={parcelId}
              onChange={(e) => setParcelId(e.target.value)}
              required
            />
            <input 
              className="input-field" 
              type="text" 
              placeholder="Location Ref (e.g., Survey-42)" 
              value={locationRef}
              onChange={(e) => setLocationRef(e.target.value)}
              required
            />
            <input 
              className="input-field" 
              type="number" 
              placeholder="Area (sq ft)" 
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
            <input 
              className="input-field" 
              type="text" 
              placeholder="Owner Wallet (0x...)" 
              value={ownerWallet}
              onChange={(e) => setOwnerWallet(e.target.value)}
              required
            />
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Register Parcel"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
