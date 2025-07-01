// calculateStats.jsx
import React from "react";
import PropTypes from "prop-types";
import characterData from "./data/character.json";
import horseData from "./data/horse.json";
import attireData from "./data/attire.json";

export const calculateStats = (characterName, items, horseName, mounted) => {
  const baseStats = {
    Skill: 0,
    Health: 0,
    Quickdraw: 0,
    Deadeye: 0,
    Horsemanship: 0,
    Grit: 0,
    Notoriety: 0,
    Charm: 0,
  };

  // Find character object by name
  const character = characterData.find((c) => c.name === characterName);

  // Sum character base stats
  character?.attributes?.forEach(({ trait_type, value }) => {
    if (baseStats.hasOwnProperty(trait_type)) {
      baseStats[trait_type] += parseInt(value, 10);
    }
  });

  // Sum item stats (attire)
  items.forEach((item) => {
    item.attributes?.forEach(({ trait_type, value }) => {
      if (trait_type && typeof value === "string") {
        // Try to parse value like "+1 Charm" or "-2 Skill"
        const match = value.match(/([+-]?\d+)\s+(\w+)/);
        if (match) {
          const val = parseInt(match[1], 10);
          const stat = match[2];
          if (baseStats.hasOwnProperty(stat)) {
            baseStats[stat] += val;
          }
        }
      }
    });
  });

  // Add horse bonus if mounted
  if (mounted && horseName) {
    const horse = horseData.find((h) => h.name === horseName);
    horse?.attributes?.forEach(({ trait_type, value }) => {
      if (trait_type === "Bonus" && typeof value === "string") {
        const match = value.match(/([+-]?\d+)\s+(\w+)/);
        if (match) {
          const val = parseInt(match[1], 10);
          const stat = match[2];
          if (baseStats.hasOwnProperty(stat)) {
            baseStats[stat] += val;
          }
        }
      }
    });
  }

  return baseStats;
};

export const StatsDisplay = ({ characterId, items, horseId, mounted = true }) => {
  const stats = calculateStats(characterId, items, horseId, mounted);

  return (
    <div className="stats-display p-4 bg-[#1c1c1c] text-white rounded-lg shadow-lg border border-yellow-700">
      <h3 className="text-xl font-bold mb-2">Combined Stats</h3>
      <ul className="grid grid-cols-2 gap-2">
        {Object.entries(stats).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span className="text-gray-300">{key}</span>
            <span className="text-yellow-400 font-semibold">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

StatsDisplay.propTypes = {
  characterId: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  horseId: PropTypes.string,
  mounted: PropTypes.bool,
};

export default StatsDisplay;
