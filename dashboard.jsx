// dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsDisplay from "./calculateStats";
import characterData from "./data/character.json";
import horseData from "./data/horse.json";
import attireData from "./data/attire.json";

const gameModes = [
  { label: "Story Mode", imgSrc: "/images/story-mode.jpg", route: "/story-mode" },
  { label: "Duels", imgSrc: "/images/duels.jpg", route: "/duels" },
  { label: "Posse Wars", imgSrc: "/images/posse-wars.png", route: "/posse-wars" },
  { label: "Marketplace", imgSrc: "/images/marketplace.png", route: "/marketplace" },
];

const getImageUrl = (url) =>
  url?.startsWith("ipfs://")
    ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
    : url || "/fallback-image.png";

const NFTCard = ({ nft, category, size, showCategory }) => {
  const sizes = { char: 160, horse: 120, attire: 80 };
  const dim = sizes[size] || 100;
  const isAttire = size === "attire";
  const categoryLower = category?.toLowerCase() || "";
  const nameLower = nft.name?.toLowerCase() || "";
  const showCategoryLabel = showCategory && !nameLower.includes(categoryLower);

  return (
    <div className="nft-border-western" style={{ textAlign: "center", width: dim, userSelect: "none" }}>
      <div
        className="nft-image-wrapper"
        style={{ width: dim, height: isAttire ? dim * 0.5 : dim, margin: "0 auto" }}
      >
        <img
          src={getImageUrl(nft.image)}
          alt={nft.name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/fallback-image.png";
          }}
        />
      </div>
      <h3 className="connected" style={{ marginTop: 8, fontSize: isAttire ? 14 : 18 }} title={nft.name}>
        {nft.name}
      </h3>
      {showCategoryLabel && (
        <p className="connected" style={{ fontStyle: "italic", fontSize: 12, margin: "4px 0" }}>
          {category}
        </p>
      )}
      {nft.rarity && (
        <p
          className="connected"
          style={{ fontWeight: "bold", color: "#f7da7d", fontSize: isAttire ? 12 : 14, margin: 0 }}
          title={`Rarity: ${nft.rarity}`}
        >
          {nft.rarity}
        </p>
      )}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [equippedItems, setEquippedItems] = useState({});
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("equippedItems");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEquippedItems(parsed);
      } catch {
        setEquippedItems({});
      }
    }
  }, []);

  // Extract equipped character and horse names
  const charId = equippedItems["char"];
  const horseId = equippedItems["horse"];

  // Prepare other equipped attire items (full objects)
  // Assume equippedItems keys other than 'char' and 'horse' store full NFT objects
  const otherEquippedItems = Object.entries(equippedItems)
    .filter(([key]) => key !== "char" && key !== "horse")
    .map(([category, nft]) => ({ ...nft, category }));

  // Helper: Find NFT in category data by name
  const findNFTByName = (name) => {
    return (
      characterData.find((nft) => nft.name === name) ||
      horseData.find((nft) => nft.name === name) ||
      attireData.find((nft) => nft.name === name)
    );
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: "min(1400px, 90vw)",
        margin: "0 auto",
        padding: 20,
        color: "#f4e2c6",
        fontFamily: "'Special Elite', monospace",
        minHeight: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        className="title"
        style={{
          fontSize: "3em",
          color: "#deb887",
          textAlign: "center",
          textShadow: "2px 2px 0 #000",
          marginBottom: 40,
          userSelect: "none",
        }}
      >
        Dashboard
      </h1>

      <div style={{ display: "flex", gap: 40, flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Left side */}
        <div
          style={{
            flex: 1,
            maxWidth: "50%",
            minWidth: 0,
            overflowY: "auto",
            paddingRight: 10,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <section style={{ marginBottom: 40 }}>
            <h2 className="connected" style={{ fontSize: "1.6em", marginBottom: 20 }}>
              Equipped Items
            </h2>

            {Object.keys(equippedItems).length === 0 ? (
              <p className="connected">No items equipped.</p>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    gap: 30,
                    marginBottom: 20,
                    flexWrap: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {charId && (
                    <NFTCard
                      nft={characterData.find((nft) => nft.name === charId)}
                      size="char"
                      showCategory={false}
                    />
                  )}
                  {horseId && (
                    <NFTCard
                      nft={horseData.find((nft) => nft.name === horseId)}
                      size="horse"
                      showCategory={false}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 20,
                    justifyContent: "center",
                  }}
                >
                  {otherEquippedItems.map(({ category, ...nft }) => (
                    <NFTCard
                      key={nft.id || nft.tokenId || category}
                      nft={nft}
                      size="attire"
                      category={category}
                      showCategory={true}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          <section>
            <h2 className="connected" style={{ fontSize: "1.6em", marginBottom: 20 }}>
              Combined Stats
            </h2>

            {(!charId && !horseId) || otherEquippedItems.length === 0 ? (
              <p className="connected">No stats available.</p>
            ) : (
              <StatsDisplay
                characterId={charId}
                horseId={horseId}
                items={otherEquippedItems}
                mounted={mounted}
              />
            )}
          </section>
        </div>

        {/* Right side */}
        <div
          style={{
            flex: 1,
            maxWidth: "50%",
            minWidth: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingLeft: 10,
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <section>
            <h2 className="connected" style={{ fontSize: "1.8em", marginBottom: 20 }}>
              Game Modes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {gameModes.map(({ label, imgSrc, route }) => (
                <button
                  key={label}
                  onClick={() => navigate(route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    backgroundColor: "#deb887",
                    color: "#1f1a1a",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: "1.2em",
                    cursor: "pointer",
                    boxShadow: "2px 2px 5px #000",
                    minHeight: 100,
                    transition: "background-color 0.2s ease",
                    userSelect: "none",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#cfa56f")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#deb887")}
                  type="button"
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#00000033",
                      borderRadius: 6,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={imgSrc || "/fallback-image.png"}
                      alt={label}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/fallback-image.png";
                      }}
                    />
                  </div>
                  <span style={{ fontWeight: "bold", fontSize: "1.4em" }}>{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 40,
          marginBottom: 20,
          userSelect: "none",
        }}
      >
        <button
          onClick={() => navigate("/profile")}
          className="connect-btn"
          style={{
            backgroundColor: "#deb887",
            color: "#1f1a1a",
            padding: "14px 28px",
            fontSize: "1.2em",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "2px 2px 5px #000",
            transition: "background-color 0.2s ease",
            userSelect: "none",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#cfa56f")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#deb887")}
          type="button"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
