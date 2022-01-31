const T = 1000000000000;
const BN = 1000000000;
const MLN = 1000000;
const K = 1000;

export default abstract class NumbersService {

    public static parseNumericValue(value: number,  decimalPlaces?: number): string {
        if (!value && value <= 0) {
            return '0';
        }

        if (value / T > 1) {
            return this.parse(value, T, 'tn');
        } else if (value / BN > 1) {
            return this.parse(value, BN, 'bn');
        } else if (value / MLN > 1) {
            return this.parse(value, MLN, 'm');
        } else if (value / (K * 10) > 1) {
            return this.parse(value, K, 'k');
        }

        return `${value.toFixed(decimalPlaces || (value < 10 ? 2 : 0))}`;
    }

    private static parse(value: number, multiplier: number, multiplierText: string) {
        const valueText = (value/multiplier).toFixed(1);
        return `${valueText}${multiplierText}`
    }
}
