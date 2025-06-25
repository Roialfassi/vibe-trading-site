// This placeholder will be replaced by our secure deployment process.
// It is essential that this line is exactly as written.
// const firebaseConfig = __FIREBASE_CONFIG__;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const predictionsGrid = document.getElementById('predictionsGrid');
const tickerFilter = document.getElementById('tickerFilter');
const providerFilter = document.getElementById('providerFilter');
const dateFilter = document.getElementById('dateFilter');
const confidenceFilter = document.getElementById('confidenceFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

let allPredictions = [];
const KNOWN_PROVIDERS = ['gemini', 'claude', 'gpt'];

function displayPredictions(predictions) {
    predictionsGrid.innerHTML = '';
    
    if (predictions.length === 0) {
        predictionsGrid.innerHTML = `<p style="text-align:center;">No predictions match the selected filters.</p>`;
        return;
    }

    predictions.forEach(predData => {
        const card = document.createElement('div');
        const provider = (predData.provider || 'generic').toLowerCase();
        
        // Check if the provider is one of our known, styled providers.
        const providerClass = KNOWN_PROVIDERS.includes(provider) ? `provider-${provider}` : 'provider-generic';
        card.className = `prediction-card ${providerClass}`;

        const ticker = predData.ticker || 'N/A';
        const cardHeader = `
            <div class="card-header">
                <h3>${ticker}</h3>
                <div class="provider-logo"></div>
            </div>`;

        let cardBodyHTML;
        
        // If the provider is UNKNOWN, dynamically display all its data.
        if (providerClass === 'provider-generic') {
            cardBodyHTML = '<div class="card-body">';
            // Loop through all data fields from Firestore for this document
            for (const key in predData) {
                // Skip fields we don't want to list generically
                if (key !== 'id' && key !== 'ticker') {
                    let value = predData[key];
                    // Format Firestore Timestamps nicely
                    if (value && typeof value.toDate === 'function') {
                        value = value.toDate().toLocaleDateString();
                    }
                    cardBodyHTML += `<p><strong>${key}:</strong> ${value}</p>`;
                }
            }
            cardBodyHTML += '</div>';
        } else {
            // Otherwise, use the standard template for KNOWN providers.
            const date = predData.date?.toDate ? predData.date.toDate().toLocaleDateString() : 'N/A';
            cardBodyHTML = `
                <div class="card-body">
                    <p><strong>Provider:</strong> ${predData.provider || 'N/A'}</p>
                    <p><strong>Prediction:</strong> ${predData.prediction || 'N/A'}</p>
                    <p><strong>Confidence:</strong> ${predData.confidence || 'N/A'}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p class="reasoning">${predData.reasoning || 'No reasoning provided.'}</p>
                </div>`;
        }
        
        card.innerHTML = cardHeader + cardBodyHTML;
        predictionsGrid.appendChild(card);
    });
}

async function fetchAndRender() {
    predictionsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center;">Loading...</div>`;
    try {
        const snapshot = await db.collection('predictions').orderBy('date', 'desc').get();
        allPredictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Populate provider filter dropdown
        const providers = [...new Set(allPredictions.map(p => p.provider))];
        providerFilter.innerHTML = '<option value="">All Providers</option>';
        providers.forEach(p => {
            if (!p) return;
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p;
            providerFilter.appendChild(option);
        });

        displayPredictions(allPredictions);
    } catch (error) {
        console.error("Error fetching predictions:", error);
        predictionsGrid.innerHTML = `<p style="color:red; grid-column: 1 / -1; text-align: center;">Failed to load data. Check console and ensure Firestore rules are correct.</p>`;
    }
}

function applyFilters() {
    let filtered = [...allPredictions];
    if (tickerFilter.value) { filtered = filtered.filter(p => p.ticker?.toUpperCase().includes(tickerFilter.value.toUpperCase())); }
    if (providerFilter.value) { filtered = filtered.filter(p => p.provider === providerFilter.value); }
    if (dateFilter.value) { const d = new Date(dateFilter.value).setHours(0,0,0,0); filtered = filtered.filter(p => p.date?.toDate().setHours(0,0,0,0) === d); }
    if (confidenceFilter.value) { filtered = filtered.filter(p => p.confidence === confidenceFilter.value); }
    displayPredictions(filtered);
}

function resetFilters() {
    tickerFilter.value = providerFilter.value = dateFilter.value = confidenceFilter.value = '';
    displayPredictions(allPredictions);
}

// Event Listeners
[tickerFilter, providerFilter, dateFilter, confidenceFilter].forEach(el => el.addEventListener('change', applyFilters));
tickerFilter.addEventListener('input', applyFilters);
resetFiltersBtn.addEventListener('click', resetFilters);
document.addEventListener('DOMContentLoaded', fetchAndRender);