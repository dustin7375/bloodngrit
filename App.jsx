import { useConnect, useAddress, metamaskWallet } from "@thirdweb-dev/react";
import { Routes, Route, useNavigate } from "react-router-dom";
import IntroVideo from "./IntroVideo";
import Profile from "./Profile";
import Dashboard from "./Dashboard";
import "./App.css";

function Home() {
  const connect = useConnect();
  const address = useAddress();
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      await connect(metamaskWallet());
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  return (
    <div className="container">
      <div className="title">Blood & Grit</div>
      {!address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <div className="connected">Welcome, partner!</div>
          <button className="connect-btn" onClick={() => navigate("/intro")}>
            Time to Ride
          </button>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/intro" element={<IntroVideo />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} /> {/* <-- Add this */}
    </Routes>
  );
}

export default App;
