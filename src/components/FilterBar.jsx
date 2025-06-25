import React from "react";
import "./styles/FilterBar.css";

export default function FilterBar({ filters, setFilters, minDate, maxDate }) {
  const providers = Array.from(filters.allProviders).sort();
  const tickers = Array.from(filters.allTickers).sort();

  const handleReset = () => {
    setFilters(f => ({
      ...f,
      from: minDate,
      to: maxDate,
      provider: "",
      ticker: ""
    }));
  };

  const hasActiveFilters = filters.provider || filters.ticker || 
    filters.from !== minDate || filters.to !== maxDate;

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h2 className="filter-title">Filter Predictions</h2>
        {hasActiveFilters && (
          <button className="reset-button" onClick={handleReset}>
            Reset Filters
          </button>
        )}
      </div>
      
      <div className="filter-bar">
        <label>
          Date From
          <input
            type="date"
            value={filters.from}
            min={minDate}
            max={filters.to}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
          />
        </label>
        
        <label>
          Date To
          <input
            type="date"
            value={filters.to}
            min={filters.from}
            max={maxDate}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
          />
        </label>
        
        <label>
          Provider
          <select
            value={filters.provider}
            onChange={e => setFilters(f => ({ ...f, provider: e.target.value }))}
          >
            <option value="">All Providers</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        
        <label>
          Stock Ticker
          <select
            value={filters.ticker}
            onChange={e => setFilters(f => ({ ...f, ticker: e.target.value }))}
          >
            <option value="">All Tickers</option>
            {tickers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}