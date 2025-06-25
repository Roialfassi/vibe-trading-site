// src/components/PredictionTable.jsx
import React from "react";

export default function PredictionTable({ data }) {
  if (!data.length) return <p>No predictions match your filters.</p>;

  return (
    <table className="prediction-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Ticker</th>
          <th>Current</th>
          <th>Goal</th>
          <th>Timing</th>
          <th>Provider</th>
          <th>Confidence</th>
          <th>Explanation</th>
          <th>Yahoo</th>
        </tr>
      </thead>
      <tbody>
        {data.map(pred => {
          // Safely format numbers or display dash
          const curr = 
            pred.current_price != null 
              ? `$${pred.current_price.toFixed(2)}` 
              : "–";
          const goal = 
            pred.goal_price != null 
              ? `$${pred.goal_price.toFixed(2)}` 
              : "–";

          return (
            <tr key={pred.id}>
              <td>{new Date(pred.date_generated).toLocaleDateString()}</td>
              <td>{pred.ticker}</td>
              <td>{curr}</td>
              <td>{goal}</td>
              <td>{pred.goal_timing}</td>
              <td>{pred.provider}</td>
              <td>{pred.confidence_level ?? "–"}</td>
              <td>{pred.short_explanation ?? "–"}</td>
              <td>
                <a
                  href={`https://finance.yahoo.com/quote/${pred.ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
