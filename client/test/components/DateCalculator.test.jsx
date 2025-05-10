import { describe, it, expect } from 'vitest';
import { calculateAge } from '../../src/components/DateCalculator';

describe('calculateAge', () => {
    it('calculates the correct age in years and months', () => {
        const birthday = '2000-01-01';
        const today = new Date('2025-03-18');
        const originalDate = Date;
        global.Date = class extends Date {
            constructor(date) {
                if (date) {
                    return super(date);
                }
                return today;
            }
        };

        const age = calculateAge(birthday);
        expect(age).toEqual({ years: '25', months: '2' });

        global.Date = originalDate;
    });

    it('calculates the correct age when the birthday is today', () => {
        const birthday = '2000-03-18';
        const today = new Date('2025-03-18');
        const originalDate = Date;
        global.Date = class extends Date {
            constructor(date) {
                if (date) {
                    return super(date);
                }
                return today;
            }
        };

        const age = calculateAge(birthday);
        expect(age).toEqual({ years: '25', months: '0' });

        global.Date = originalDate;
    });

    it('calculates the correct age when the birthday is in the future', () => {
        const birthday = '2025-04-01';
        const today = new Date('2025-03-18');
        const originalDate = Date;
        global.Date = class extends Date {
            constructor(date) {
                if (date) {
                    return super(date);
                }
                return today;
            }
        };

        const age = calculateAge(birthday);
        expect(age).toEqual({ years: '-1', months: '11' });

        global.Date = originalDate;
    });
});