/**
 * Standardized filter primitive *in* and *result* attribute naming functions
 */

export const input = idx => idx ? `fe${idx - 1}` : 'SourceGraphic';
export const output = idx => `fe${idx}`;

/** Get numeric value (amount, intensity etc.) of a filter */
export const amountOf = (filters, name) => filters ? filters.get(name) || 0 : 0;
