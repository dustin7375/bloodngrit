import React, { useState } from "react";
import {
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useConnect,
  useDisconnect,
  metamaskWallet,
} from "@thirdweb-dev/react";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0xCbb69C3A4652565342822A7DcE39Eb961DC3147E";
const DUST_CONTRACT_ADDRESS = "0x6Fac47f73fac8Eb8113AB16556d5099e3755deF4";

// Converts ipfs:// to a usable gateway URL
function resolveIPFS(url) {
  if (!url) return null;
  return url.startsWith("ipfs://")
    ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
    : url;
}

// Categories with subcategories
const categories = [
  {
    label: "Attire",
    trait: "attire",
    subcategories: [
      { label: "All", trait: "all" },
      { label: "Hat", trait: "hat" },
      { label: "Coat", trait: "coat" },
      { label: "Chaps", trait: "chaps" },
      { label: "Gloves", trait: "gloves" },
      { label: "Boots", trait: "boots" },
    ],
  },
  {
    label: "Weapons",
    trait: "weapon",
    subcategories: [
      { label: "All", trait: "all" },
      { label: "Pistols", trait: "pistol" },
      { label: "Rifles", trait: "rifle" },
      { label: "Knives", trait: "knife" },
      { label: "Special Weapons", trait: "special" },
    ],
  },
  { label: "Horses", trait: "horse", subcategories: null },
  { label: "Characters", trait: "char", subcategories: null },
  { label: "Food & Potions", trait: "food", subcategories: null },
];

// Filter NFTs by category and optional subcategory
function filterByCategory(nfts, category, subcategory) {
  if (!category) return [];

  const mainCat = categories.find((cat) => cat.trait === category);
  if (!mainCat) return [];

  if (!mainCat.subcategories || subcategory === "all") {
    if (category === "attire") {
      const attireTraits = ["hat", "coat", "chaps", "boots", "gloves", "attire"];
      return nfts.filter((nft) =>
        nft.metadata.attributes?.some(
          (attr) =>
            attr.trait_type.toLowerCase() === "type" &&
            attireTraits.includes(attr.value.toLowerCase())
        )
      );
    }

    if (category === "weapon") {
      const weaponTraits = ["pistol", "rifle", "knife", "special", "weapon"];
      return nfts.filter((nft) =>
        nft.metadata.attributes?.some(
          (attr) =>
            attr.trait_type.toLowerCase() === "type" &&
            weaponTraits.includes(attr.value.toLowerCase())
        )
      );
    }

    return nfts.filter((nft) =>
      nft.metadata.attributes?.some(
        (attr) =>
          attr.trait_type.toLowerCase() === "type" &&
          attr.value.toLowerCase() === category.toLowerCase()
      )
    );
  }

  // Filter by subcategory trait
  return nfts.filter((nft) =>
    nft.metadata.attributes?.some(
      (attr) =>
        attr.trait_type.toLowerCase() === "type" &&
        attr.value.toLowerCase() === subcategory.toLowerCase()
    )
  );
}

export default function Profile() {
  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const navigate = useNavigate();

  const { contract, isLoading: contractLoading } = useContract(
    CONTRACT_ADDRESS,
    "edition-drop"
  );

  const { contract: dustContract } = useContract(DUST_CONTRACT_ADDRESS, "token");

  const { data: nfts, isLoading: nftsLoading, error } = useOwnedNFTs(
    contract,
    address
  );

  // Fix here: no "enabled" option, pass null args if contract/address missing
  const {
    data: dustBalance,
    isLoading: dustBalanceLoading,
    error: dustBalanceError,
  } = useContractRead(
    dustContract ? dustContract : null,
    "balanceOf",
    dustContract && address ? [address] : null
  );

  const [selectedCategory, setSelectedCategory] = useState(categories[0].trait); // Default: "attire"
  const [selectedSubcategory, setSelectedSubcategory] = useState("all"); // Default subcategory

  // Track equipped items: one NFT per category trait
  const [equippedItems, setEquippedItems] = useState({}); // { [categoryTrait]: nft }

  if (!address) {
    return (
      <div className="p-6 text-center text-white">
        <button
          onClick={() => connect(metamaskWallet())}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        ⚠️ Error loading NFTs: {error.message}
      </div>
    );
  }

  if (dustBalanceError) {
    return (
      <div className="p-6 text-red-500 text-center">
        ⚠️ Error loading $DUST balance: {dustBalanceError.message}
      </div>
    );
  }

  const filteredNFTs = nfts
    ? filterByCategory(nfts, selectedCategory, selectedSubcategory)
    : [];

  const currentSubcategories =
    categories.find((cat) => cat.trait === selectedCategory)?.subcategories ||
    null;

  // Helper: get NFT category trait from its metadata attributes
  function getNFTCategoryTrait(nft) {
    if (!nft?.metadata?.attributes) return null;
    const attr = nft.metadata.attributes.find(
      (a) => a.trait_type.toLowerCase() === "type"
    );
    return attr ? attr.value.toLowerCase() : null;
  }

  // Handle equip NFT button click
  function handleEquip(nft) {
    const nftCategoryTrait = getNFTCategoryTrait(nft);
    if (!nftCategoryTrait) return;

    // Only one NFT per category trait
    setEquippedItems((prev) => ({
      ...prev,
      [nftCategoryTrait]: nft,
    }));
  }

  // Check if NFT is equipped (to show "Equipped" badge or disable equip button)
  function isEquipped(nft) {
    const nftCategoryTrait = getNFTCategoryTrait(nft);
    if (!nftCategoryTrait) return false;
    const equippedNFT = equippedItems[nftCategoryTrait];
    if (!equippedNFT) return false;
    return equippedNFT.tokenId === nft.tokenId;
  }

  // Handle next button click, save equipped items and navigate
  function handleNext() {
    // Save equipped items to localStorage (or your preferred state management)
    localStorage.setItem(
      "equippedItems",
      JSON.stringify(
        Object.fromEntries(
          Object.entries(equippedItems).map(([cat, nft]) => [cat, nft.metadata])
        )
      )
    );
    navigate("/dashboard"); // Change to your actual dashboard route
  }

  return (
    <div className="container">
      <div className="bg-gray-900 text-white min-h-screen flex flex-col">
        <div className="mx-auto px-8 w-full max-w-7xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <button
              onClick={disconnect}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Disconnect
            </button>
          </div>

          {/* $DUST Balance display */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              $DUST Balance:{" "}
              {dustBalanceLoading
                ? "Loading..."
                : dustBalance
                ? (dustBalance / 1e18).toFixed(2)
                : "0.00"}
            </h2>
          </div>

          {/* Main category selector */}
          <div className="mb-4 flex flex-wrap gap-3">
            {categories.map(({ label, trait }) => (
              <button
                key={trait}
                onClick={() => {
                  setSelectedCategory(trait);
                  setSelectedSubcategory("all");
                }}
                className={`px-4 py-2 rounded-full border font-semibold text-sm ${
                  selectedCategory === trait
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-600 hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Subcategory selector */}
          {currentSubcategories && (
            <div className="mb-6 flex flex-wrap gap-3">
              {currentSubcategories.map(({ label, trait }) => (
                <button
                  key={trait}
                  onClick={() => setSelectedSubcategory(trait)}
                  className={`px-3 py-1 rounded-full border font-semibold text-xs ${
                    selectedSubcategory === trait
                      ? "bg-yellow-600 border-yellow-600"
                      : "border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* NFT grid */}
          {contractLoading || nftsLoading ? (
            <p className="text-center">⏳ Loading your NFTs…</p>
          ) : filteredNFTs.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto px-6"
              style={{ maxHeight: "70vh" }}
            >
              {filteredNFTs.map((nft, index) => {
                const metadata = nft?.metadata;
                const imageUrl = resolveIPFS(metadata?.image);

                if (!metadata) {
                  console.warn("Missing metadata for NFT", nft);
                  return null;
                }

                const equipped = isEquipped(nft);

                return (
                  <div
                    key={metadata?.id || nft.tokenId || index}
                    className="bg-gray-800 rounded-lg p-4 border border-yellow-500 shadow flex flex-col items-center nft-border-western"
                    style={{ minHeight: "320px" }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={metadata.name || "NFT"}
                        className="rounded-md mb-3"
                        style={{
                          maxWidth: "150px",
                          maxHeight: "150px",
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/fallback-image.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-700 rounded-md mb-3 flex items-center justify-center text-sm text-gray-300">
                        🐎 No Image Available
                      </div>
                    )}

                    <h2 className="text-md font-semibold mb-1 truncate text-center">
                      {metadata?.name || "Unnamed NFT"}
                    </h2>

                    {Array.isArray(metadata?.attributes) &&
                      metadata.attributes.length > 0 && (
                        <ul className="text-xs text-gray-300 space-y-0.5 flex-1 overflow-auto text-center">
                          {metadata.attributes.map((attr, attrIndex) => (
                            <li key={attrIndex}>
                              <span className="font-semibold">{attr.trait_type}:</span>{" "}
                              {attr.value}
                            </li>
                          ))}
                        </ul>
                      )}

                    <button
                      onClick={() => handleEquip(nft)}
                      disabled={equipped}
                      className={`mt-3 px-4 py-1 rounded-lg font-semibold text-sm ${
                        equipped
                          ? "bg-green-600 cursor-default"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {equipped ? "Equipped" : "Equip"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center">📭 You don’t own any NFTs from this category.</p>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleNext}
              disabled={Object.keys(equippedItems).length === 0}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 py-2 rounded-lg"
            >
              Next: View Dashboard
            </button>
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
