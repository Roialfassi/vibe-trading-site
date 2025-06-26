// src/App.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import FilterBar from "./components/FilterBar";
import PredictionGrid from "./components/PredictionGrid";
import "./components/styles/App.css";

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filters, setFilters]       = useState({
    from: "",
    to: "",
    provider: "",
    ticker: "",
    sortOrder: "desc",           // ← "desc" (newest first) or "asc" (oldest first)
    allProviders: new Set(),
    allTickers:   new Set()
  });

  // Fetch on mount
  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "predictions"));
      const docs = snap.docs.map(doc => ({
        id: doc.id,
        provider:        doc.data().Provider,
        current_price:   doc.data().current_price,
        date_generated:  doc.data().date_generated,
        goal_price:      doc.data().goal_price,
        goal_timing:     doc.data().goal_timing,
        ticker:          doc.data().ticker,
        confidence_level:doc.data().confidence_level,
        short_explanation:doc.data().short_explanation
      }));

      // Unique sets
      const providers = new Set(docs.map(d => d.provider).filter(Boolean));
      const tickers   = new Set(docs.map(d => d.ticker).filter(Boolean));

      // Date bounds
      const dates = docs
        .map(d => d.date_generated?.slice(0, 10))
        .filter(Boolean)
        .sort();
      const minDate = dates[0] || "";
      const maxDate = dates[dates.length - 1] || "";

      setPredictions(docs);
      setFilters(f => ({
        ...f,
        allProviders: providers,
        allTickers:   tickers,
        from:         minDate,
        to:           maxDate
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Filter
  const filtered = predictions.filter(pred => {
    const date = pred.date_generated?.slice(0, 10) || "";
    const tickerMatch = !filters.ticker ||
      pred.ticker?.toUpperCase().includes(filters.ticker.toUpperCase());
    return (
      tickerMatch &&
      (!filters.provider || pred.provider === filters.provider) &&
      (!filters.from     || date >= filters.from) &&
      (!filters.to       || date <= filters.to)
    );
  });

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.date_generated).getTime();
    const db = new Date(b.date_generated).getTime();
    return filters.sortOrder === "asc" ? da - db : db - da;
  });

  // Stats bar uses filtered.length
  const activeCount   = filtered.length;
  const trackedCount  = filters.allTickers.size;
  const providerCount = filters.allProviders.size;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Vibe Trading</h1>
        <p className="app-subtitle">
          AI-Powered Stock Predictions Platform
        </p>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPredictions}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading predictions...</p>
        </div>
      ) : (
        <>
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            minDate={filters.from}
            maxDate={filters.to}
          />

          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">Active Predictions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{trackedCount}</span>
              <span className="stat-label">Tracked Stocks</span>
            </div>
            <div className="stat">
              <span className="stat-value">{providerCount}</span>
              <span className="stat-label">AI Providers</span>
            </div>
          </div>

          {/* Pass selectedTicker so each card knows when to load its live‐price widget */}
          <PredictionGrid
            data={sorted}
            selectedTicker={filters.ticker}
          />
        </>
      )}
    </div>
  );
}

export default App;
