class DataProcessor {
    getDefaultFormData() {
        return {
            matchesPlayed: 10,
            wins: 4,
            draws: 3,
            losses: 3,
            goalsScored: 14,
            goalsConceded: 12,
            goalDifference: 2,
            formRating: 5.5,
            avgGoalsScored: 1.4,
            avgGoalsConceded: 1.2
        };
    }
}

const dataProcessor = new DataProcessor();
