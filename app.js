// STEP 1: Paste your Firebase config object here.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const predictionsGrid = document.getElementById('predictionsGrid');
const loader = document.getElementById('loader');
const tickerFilter = document.getElementById('tickerFilter');
const providerFilter = document.getElementById('providerFilter');
const dateFilter = document.getElementById('dateFilter');
const confidenceFilter = document.getElementById('confidenceFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

let allPredictions = [];
let uniqueProviders = new Set();

// Fetch predictions from Firestore
async function fetchPredictions() {
    loader.style.display = 'block';
    predictionsGrid.innerHTML = ''; // Clear existing predictions

    try {
        const snapshot = await db.collection('predictions').orderBy('date', 'desc').get();
        allPredictions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        populateProviderFilter();
        displayPredictions(allPredictions);

    } catch (error) {
        console.error("Error fetching predictions: ", error);
        predictionsGrid.innerHTML = `<p style="color:red; text-align:center;">Failed to load predictions. Please check the console for more details.</p>`;
    } finally {
        loader.style.display = 'none';
    }
}

function populateProviderFilter() {
    uniqueProviders.clear(); // Clear previous entries
    allPredictions.forEach(pred => uniqueProviders.add(pred.provider));
    
    // Clear existing options except the first one
    providerFilter.innerHTML = '<option value="">All Providers</option>';
    
    uniqueProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = provider;
        providerFilter.appendChild(option);
    });
}

function displayPredictions(predictions) {
    predictionsGrid.innerHTML = ''; // Clear grid before displaying
    
    if (predictions.length === 0) {
        predictionsGrid.innerHTML = `<p style="text-align:center;">No predictions match the selected filters.</p>`;
        return;
    }

    predictions.forEach(pred => {
        const predDiv = document.createElement('div');
        predDiv.classList.add('prediction-div');
        
        // Add provider-specific class for styling
        if (pred.provider) {
            predDiv.classList.add(`provider-${pred.provider.toLowerCase()}`);
        }

        // Firestore timestamp to readable date
        const date = pred.date && pred.date.toDate ? pred.date.toDate().toLocaleDateString() : 'N/A';

        predDiv.innerHTML = `
            <h3>${pred.ticker || 'N/A'}</h3>
            <p><strong>Provider:</strong> ${pred.provider || 'N/A'}</p>
            <p><strong>Prediction:</strong> ${pred.prediction || 'N/A'}</p>
            <p><strong>Confidence:</strong> ${pred.confidence || 'N/A'}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Reasoning:</strong> ${pred.reasoning || 'No reasoning provided.'}</p>
        `;
        predictionsGrid.appendChild(predDiv);
    });
}

function applyFilters() {
    let filtered = allPredictions;

    // Ticker filter (case-insensitive)
    const tickerValue = tickerFilter.value.toUpperCase().trim();
    if (tickerValue) {
        filtered = filtered.filter(p => p.ticker && p.ticker.toUpperCase().includes(tickerValue));
    }

    // Provider filter
    if (providerFilter.value) {
        filtered = filtered.filter(p => p.provider === providerFilter.value);
    }

    // Date filter
    if (dateFilter.value) {
        const filterDate = new Date(dateFilter.value).setHours(0,0,0,0);
        filtered = filtered.filter(p => {
            const predDate = p.date && p.date.toDate ? p.date.toDate().setHours(0,0,0,0) : null;
            return predDate === filterDate;
        });
    }

    // Confidence filter
    if (confidenceFilter.value) {
        filtered = filtered.filter(p => p.confidence === confidenceFilter.value);
    }

    displayPredictions(filtered);
}

function resetFilters() {
    tickerFilter.value = '';
    providerFilter.value = '';
    dateFilter.value = '';
    confidenceFilter.value = '';
    displayPredictions(allPredictions);
}

// Event Listeners
tickerFilter.addEventListener('input', applyFilters);
providerFilter.addEventListener('change', applyFilters);
dateFilter.addEventListener('change', applyFilters);
confidenceFilter.addEventListener('change', applyFilters);
resetFiltersBtn.addEventListener('click', resetFilters);

// Initial Load
document.addEventListener('DOMContentLoaded', fetchPredictions);