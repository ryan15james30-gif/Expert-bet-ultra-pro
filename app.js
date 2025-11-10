class ExpertBetApp {
    constructor() {
        this.apiKey = localStorage.getItem('expertbet_api_key') || '';
        this.currentMatches = [];
        this.init();
    }

    init() {
        if (this.apiKey) {
            document.getElementById('apiKey').value = this.apiKey;
            this.updateStatus('connected', '✅ API Connectée');
        } else {
            this.updateStatus('warning', '⚠️ Configuration requise');
        }
    }

    updateStatus(status, text) {
        const badge = document.getElementById('apiStatus');
        if (badge) {
            badge.className = `status-badge ${status}`;
            badge.innerHTML = `<span class="status-dot"></span><span>${text}</span>`;
        }
    }
}

function saveApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (!key) {
        alert('⚠️ Veuillez entrer une clé API valide');
        return;
    }
    localStorage.setItem('expertbet_api_key', key);
    alert('✅ Clé API enregistrée avec succès !');
    window.location.reload();
}

async function loadMatches() {
    const apiKey = localStorage.getItem('expertbet_api_key');
    if (!apiKey) {
        alert('⚠️ Veuillez d\'abord configurer votre clé API');
        return;
    }

    const league = document.getElementById('selectLeague').value;
    const loading = document.getElementById('loadingMatches');
    const container = document.getElementById('matchesContainer');
    const noData = document.getElementById('noPredictions');

    loading.style.display = 'block';
    container.innerHTML = '';
    noData.style.display = 'none';

    try {
        const response = await fetch(
            `https://api.football-data.org/v4/competitions/${league}/matches?status=SCHEDULED`,
            {
                headers: {
                    'X-Auth-Token': apiKey
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const matches = data.matches.slice(0, 10);

        loading.style.display = 'none';

        if (matches.length === 0) {
            noData.style.display = 'block';
            noData.textContent = '⚠️ Aucun match à venir pour cette compétition';
            return;
        }

        for (const match of matches) {
            const prediction = await mlEngine.predict(match, {});
            const card = createMatchCard(match, prediction);
            container.appendChild(card);
        }

        updateStats(matches.length, matches.length, 87);

    } catch (error) {
        loading.style.display = 'none';
        noData.style.display = 'block';
        noData.textContent = `❌ Erreur: ${error.message}. Vérifiez votre clé API.`;
    }
}

function createMatchCard(match, prediction) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    const date = new Date(match.utcDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const kelly = predictionAlgo.kellyStakingCriterion(
        parseFloat(prediction.prediction.probability) / 100,
        parseFloat(prediction.prediction.odds),
        100
    );

    card.innerHTML = `
        <div class="match-header">
            <span>📅 ${date}</span>
            <span class="league-badge">${match.competition.name}</span>
        </div>
        <div class="match-teams">
            <div class="team">${match.homeTeam.name}</div>
            <div class="vs">VS</div>
            <div class="team">${match.awayTeam.name}</div>
        </div>
        <div class="prediction-box">
            <div class="pred-header">
                <span>🎯 PRÉDICTION IA</span>
                <span class="confidence">${prediction.confidence}% ${'⭐'.repeat(Math.ceil(prediction.confidence / 20))}</span>
            </div>
            <div class="pred-main">
                <div class="pred-type">${prediction.prediction.type}</div>
                <div class="pred-details">
                    <span>💰 Cote: ${prediction.prediction.odds}</span>
                    <span>📊 Probabilité: ${prediction.prediction.probability}%</span>
                </div>
            </div>
            <div class="kelly-box">
                💵 Mise recommandée (Kelly): ${kelly.stake}€ (${kelly.percentage}% de votre bankroll)
            </div>
            <details>
                <summary>📊 Analyse détaillée IA</summary>
                ${prediction.analysis.map(item => `<div>${item}</div>`).join('')}
            </details>
        </div>
    `;
    
    return card;
}

function updateStats(matches, predictions, confidence) {
    document.getElementById('totalMatches').textContent = matches;
    document.getElementById('totalPredictions').textContent = predictions;
    document.getElementById('avgConfidence').textContent = confidence + '%';
}

document.addEventListener('DOMContentLoaded', () => {
    new ExpertBetApp();
});
