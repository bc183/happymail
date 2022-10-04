import { compareDate } from "../utils";

class FilterService {
    contains(value: string, valueToBeCompared: string): boolean {
        return value.includes(valueToBeCompared);
    }

    equals<T>(value: T, valueToBeCompared: T): boolean {
        return value === valueToBeCompared;
    }

    lessThan(value: Date, valueToBeCompared: Date): boolean {
        return compareDate(value, valueToBeCompared) === -1;
    }

    greaterThan(value: Date, valueToBeCompared: Date): boolean {
        return compareDate(value, valueToBeCompared) === 1;
    }
}

export default new FilterService();
