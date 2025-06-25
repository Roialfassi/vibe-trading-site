import React from "react";
import "./styles/Card.css";

export default function PredictionCard({ pred }) {
  const {
    date_generated,
    ticker,
    current_price, // This is actually price at time of prediction
    goal_price,
    goal_timing,
    provider,
    confidence_level,
    short_explanation,
  } = pred;

  const priceAtPrediction = current_price != null ? current_price.toFixed(2) : 0;
  const goal = goal_price != null ? goal_price.toFixed(2) : 0;
  
  // Calculate potential return percentage
  const returnPct = current_price && goal_price 
    ? ((goal_price - current_price) / current_price * 100).toFixed(1)
    : 0;
  
  const isPositive = returnPct > 0;
  
  // Determine provider theme
  const getProviderTheme = (providerName) => {
    if (!providerName) return "default";
    const lowerProvider = providerName.toLowerCase();
    
    if (lowerProvider.includes("gpt") || lowerProvider.includes("openai")) return "gpt";
    if (lowerProvider.includes("claude") || lowerProvider.includes("anthropic")) return "claude";
    if (lowerProvider.includes("gemini") || lowerProvider.includes("google")) return "gemini";
    return "default";
  };
  
  const providerTheme = getProviderTheme(provider);
  

  
  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={`prediction-card theme-${providerTheme}`}>
      <div className="card-header">
        <div className="ticker-section">
          <h3 className="ticker">{ticker}</h3>
          <span className={`provider-badge provider-${providerTheme}`}>
            {provider || "Unknown"}
          </span>
        </div>
        <div className="date">
          {formatDate(date_generated)}
        </div>
      </div>

      <div className="price-section">
        <div className="price-row">
          <div className="price-item">
            <span className="price-label">Price at Prediction</span>
            <span className="price-value">${priceAtPrediction}</span>
          </div>
          <div className="price-arrow">
            <span className={`arrow ${isPositive ? 'arrow-up' : 'arrow-down'}`}>
              {isPositive ? '📈' : '📉'}
            </span>
          </div>
          <div className="price-item">
            <span className="price-label">Target Price</span>
            <span className="price-value target">${goal}</span>
          </div>
        </div>
        
        <div className={`return-percentage ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{returnPct}%
          <span className="return-label">expected return</span>
        </div>
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">⏱️ Timeframe</span>
          <span className="detail-value">{goal_timing || 'Not specified'}</span>
        </div>
        
        {confidence_level && (
          <div className="detail-row">
            <span className="detail-label">📊 Confidence</span>
            <div className="confidence-wrapper">
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${confidence_level}%` }}
                />
              </div>
              <span className="confidence-text">{confidence_level}%</span>
            </div>
          </div>
        )}
      </div>

      {short_explanation && (
        <div className="explanation">
          <p>{short_explanation}</p>
        </div>
      )}

      <div className="card-footer">
        <a
          href={`https://finance.yahoo.com/quote/${ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          className="yahoo-link"
        >
          <span>View on Yahoo Finance to see it came true</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 2L10 10L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}