/**
 * F1 score calculation (formula below) provides a balanced score weighing both precision and recall.
 *  Precision is the number of positive matches divided by the same + any unexpected additions
 *  Recall is the number of positive matches against the expected length
 *
 * F1 score= 2 * ((Precision * Recall) / (Precision + Recall))
 */

export const CalculateF1Score = (expectedLength: number, matches: number, additions: number): number => {
    if (matches === 0) {
        return 0;
    }

    const precision = matches / (matches + additions);
    const recall = matches / expectedLength;

    return Math.round((2 * ((precision * recall) / (precision + recall))) * 100);
}
