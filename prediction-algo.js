class PredictionAlgorithms {
    kellyStakingCriterion(probability, odds, bankroll) {
        const p = probability;
        const b = odds - 1;
        const q = 1 - p;
        
        const kelly = (b * p - q) / b;
        const fractionalKelly = kelly * 0.25; // Kelly fractionnaire (25%)
        
        if (fractionalKelly <= 0) {
            return {
                stake: 0,
                percentage: 0,
                recommendation: 'Ne pas parier'
            };
        }
        
        const stakePercent = Math.min(fractionalKelly * 100, 5); // Max 5%
        const stakeAmount = (bankroll * stakePercent) / 100;
        
        return {
            stake: stakeAmount.toFixed(2),
            percentage: stakePercent.toFixed(2),
            recommendation: `Miser ${stakePercent.toFixed(1)}% de votre bankroll`
        };
    }
}

const predictionAlgo = new PredictionAlgorithms();
