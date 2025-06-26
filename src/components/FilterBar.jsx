// src/components/FilterBar.jsx
import React from "react";
import "./styles/FilterBar.css";

export default function FilterBar({
  filters,
  setFilters,
  minDate,
  maxDate
}) {
  const providers = Array.from(filters.allProviders).sort();
  const tickers   = Array.from(filters.allTickers).sort();

  const handleReset = () => {
    setFilters({
      ...filters,
      from: minDate,
      to:   maxDate,
      provider: "",
      ticker:   "",
      sortOrder: "desc"
    });
  };

  const hasActiveFilters =
    filters.provider ||
    filters.ticker ||
    filters.from !== minDate ||
    filters.to   !== maxDate ||
    filters.sortOrder !== "desc";

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h2 className="filter-title">Filter &amp; Sort</h2>
        {hasActiveFilters && (
          <button className="reset-button" onClick={handleReset}>
            Reset
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
            onChange={e =>
              setFilters(f => ({ ...f, from: e.target.value }))
            }
          />
        </label>

        <label>
          Date To
          <input
            type="date"
            value={filters.to}
            min={filters.from}
            max={maxDate}
            onChange={e =>
              setFilters(f => ({ ...f, to: e.target.value }))
            }
          />
        </label>

        <label>
          Provider
          <select
            value={filters.provider}
            onChange={e =>
              setFilters(f => ({ ...f, provider: e.target.value }))
            }
          >
            <option value="">All Providers</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          Ticker
          <select
            value={filters.ticker}
            onChange={e =>
              setFilters(f => ({ ...f, ticker: e.target.value }))
            }
          >
            <option value="">All Tickers</option>
            {tickers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Sort by Date
          <select
            value={filters.sortOrder}
            onChange={e =>
              setFilters(f => ({ ...f, sortOrder: e.target.value }))
            }
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </label>
      </div>
    </div>
  );
}
