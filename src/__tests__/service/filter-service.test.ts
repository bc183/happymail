import filterService from "../../service/filter-service";

describe("FilterService", () => {
    describe("contains", () => {
        it("should return true if the value contains the given value", () => {
            // given
            const value = "Test is a test";
            const valueToBeCompared = "test";

            // execute
            const actualValue = filterService.contains(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(true);
        });

        it("should return false if the value does not contains the given value", () => {
            // given
            const value = "Test is a test";
            const valueToBeCompared = "testing";

            // execute
            const actualValue = filterService.contains(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(false);
        });
    });

    describe("equals", () => {
        it("should return true if the value is equals to the given value", () => {
            // given
            const value = "Test is a test";
            const valueToBeCompared = "Test is a test";

            // execute
            const actualValue = filterService.equals(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(true);
        });

        it("should return false if the value is not equal to the given value", () => {
            // given
            const value = "Test is a test";
            const valueToBeCompared = "testing";

            // execute
            const actualValue = filterService.equals(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(false);
        });
    });

    describe("lessThan", () => {
        it("should return true if the value is less than the given value", () => {
            // given
            const value = new Date("2022-10-04");
            const valueToBeCompared = new Date("2022-10-06");

            // execute
            const actualValue = filterService.lessThan(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(true);
        });

        it("should return false if the value is not less than the given value", () => {
            // given
            const value = new Date("2022-10-06");
            const valueToBeCompared = new Date("2022-10-06");

            // execute
            const actualValue = filterService.lessThan(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(false);
        });
    });

    describe("greaterThan", () => {
        it("should return true if the value is greater than the given value", () => {
            // given
            const value = new Date("2022-10-08");
            const valueToBeCompared = new Date("2022-10-06");

            // execute
            const actualValue = filterService.greaterThan(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(true);
        });

        it("should return false if the value is not greater than the given value", () => {
            // given
            const value = new Date("2022-10-06");
            const valueToBeCompared = new Date("2022-10-06");

            // execute
            const actualValue = filterService.greaterThan(value, valueToBeCompared);

            // assert
            expect(actualValue).toBe(false);
        });
    });
});
