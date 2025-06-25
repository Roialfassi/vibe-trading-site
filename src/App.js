import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import FilterBar from "./components/FilterBar";
import PredictionGrid from "./components/PredictionGrid";
import "./components/styles/App.css";

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    provider: "",
    ticker: "",
    allProviders: new Set(),
    allTickers: new Set()
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "predictions"));
      
      const docs = snap.docs.map(doc => ({
        id: doc.id,
        provider: doc.data().Provider,
        current_price: doc.data().current_price, // Price at time of prediction
        date_generated: doc.data().date_generated,
        goal_price: doc.data().goal_price,
        goal_timing: doc.data().goal_timing,
        ticker: doc.data().ticker,
        confidence_level: doc.data().confidence_level,
        short_explanation: doc.data().short_explanation
      }));

      // Extract unique providers and tickers
      const providers = new Set(docs.map(d => d.provider).filter(Boolean));
      const tickers = new Set(docs.map(d => d.ticker).filter(Boolean));
      
      // Calculate date range
      const dates = docs.map(d => d.date_generated).filter(Boolean).sort();
      const minDate = dates[0]?.slice(0, 10) || "";
      const maxDate = dates[dates.length - 1]?.slice(0, 10) || "";

      setPredictions(docs);
      setFilters(prev => ({
        ...prev,
        allProviders: providers,
        allTickers: tickers,
        from: minDate,
        to: maxDate
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Failed to load predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter predictions
  const filteredPredictions = predictions.filter(pred => {
    const date = pred.date_generated?.slice(0, 10);
    
    // Ticker filter - case insensitive partial match
    const tickerMatch = !filters.ticker || 
      pred.ticker?.toUpperCase().includes(filters.ticker.toUpperCase());
    
    return (
      tickerMatch &&
      (!filters.provider || pred.provider === filters.provider) &&
      (!filters.from || !date || date >= filters.from) &&
      (!filters.to || !date || date <= filters.to)
    );
  });

  // Calculate min/max dates for filter constraints
  const dates = predictions
    .map(d => d.date_generated?.slice(0, 10))
    .filter(Boolean)
    .sort();
  const minDate = dates[0] || "";
  const maxDate = dates[dates.length - 1] || "";

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          Vibe Trading
        </h1>
        <p className="app-subtitle">AI-Powered Stock Predictions Platform</p>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPredictions}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading predictions...</p>
        </div>
      ) : (
        <>
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            minDate={minDate}
            maxDate={maxDate}
            allTickers={filters.allTickers}
          />
          
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{filteredPredictions.length}</span>
              <span className="stat-label">Active Predictions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{filters.allTickers.size}</span>
              <span className="stat-label">Tracked Stocks</span>
            </div>
            <div className="stat">
              <span className="stat-value">{filters.allProviders.size}</span>
              <span className="stat-label">AI Providers</span>
            </div>
          </div>
          
          <PredictionGrid data={filteredPredictions} />
            
        </>
      )}
    </div>
  );
}

export default App;