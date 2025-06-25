// src/components/PredictionGrid.jsx
import React from "react";
import PredictionCard from "./PredictionCard";
import "./styles/Grid.css";

export default function PredictionGrid({ data }) {
  if (!data.length)
    return <p className="no-data">No predictions match your filters.</p>;

  return (
    <div className="grid">
      {data.map((pred) => (
        <PredictionCard key={pred.id} pred={pred} />
      ))}
    </div>
  );
}
