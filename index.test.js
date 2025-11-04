const { main } = require("./index");

function isIsoDateString(value) {
    try {
        return new Date(value).toISOString() === value;
    } catch {
        return false;
    }
}

function calculateAgeFromBirthdate(birthdateIso) {
    const birthdate = new Date(birthdateIso);
    const today = new Date();

    let age = today.getUTCFullYear() - birthdate.getUTCFullYear();
    const monthDifference = today.getUTCMonth() - birthdate.getUTCMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getUTCDate() < birthdate.getUTCDate())
    ) {
        age--;
    }

    return age;
}

function withMockedRandom(randomSequence, callback) {
    const originalRandom = Math.random;
    let callIndex = 0;

    Math.random = () => {
        const value = randomSequence[callIndex % randomSequence.length];
        callIndex++;
        return value;
    };

    try {
        return callback();
    } finally {
        Math.random = originalRandom;
    }
}

describe("main(inputDto) — генерация сотрудников и статистики", () => {
    test("возвращает объект со всеми ключами и корректными типами", () => {
        const result = main({ count: 7, age: { min: 19, max: 35 } });

        const expectedKeys = [
            "total",
            "workload10",
            "workload20",
            "workload30",
            "workload40",
            "averageAge",
            "minAge",
            "maxAge",
            "medianAge",
            "medianWorkload",
            "averageWorkloadFemale",
            "sortedByWorkload",
        ].sort();

        expect(typeof result).toBe("object");
        expect(Object.keys(result).sort()).toEqual(expectedKeys);
        expect(result.total).toBe(result.sortedByWorkload.length);
    });

    test("каждый сотрудник имеет корректную структуру и допустимые значения workload", () => {
        const result = main({ count: 30, age: { min: 20, max: 30 } });
        const allowedWorkloads = new Set([10, 20, 30, 40]);

        for (const employee of result.sortedByWorkload) {
            expect(Object.keys(employee).sort()).toEqual(
                ["birthdate", "gender", "name", "surname", "workload"].sort()
            );
            expect(["male", "female"]).toContain(employee.gender);
            expect(allowedWorkloads.has(employee.workload)).toBe(true);
        }
    });

    test("дата рождения в ISO-формате и возраст в заданном интервале", () => {
        const minAge = 19;
        const maxAge = 35;
        const result = main({ count: 25, age: { min: minAge, max: maxAge } });

        for (const employee of result.sortedByWorkload) {
            expect(isIsoDateString(employee.birthdate)).toBe(true);
            const actualAge = calculateAgeFromBirthdate(employee.birthdate);
            expect(actualAge).toBeGreaterThanOrEqual(minAge);
            expect(actualAge).toBeLessThanOrEqual(maxAge);
        }
    });

    test("sortedByWorkload отсортирован по возрастанию workload", () => {
        const result = main({ count: 40, age: { min: 20, max: 25 } });
        const workloads = result.sortedByWorkload.map((employee) => employee.workload);

        for (let i = 1; i < workloads.length; i++) {
            expect(workloads[i] >= workloads[i - 1]).toBe(true);
        }
    });

    test("значения workload10–40 совпадают с фактическим распределением сотрудников", () => {
        const result = main({ count: 100, age: { min: 20, max: 25 } });

        const workloadCounts = { 10: 0, 20: 0, 30: 0, 40: 0 };
        for (const employee of result.sortedByWorkload) {
            workloadCounts[employee.workload]++;
        }

        expect(result.workload10).toBe(workloadCounts[10]);
        expect(result.workload20).toBe(workloadCounts[20]);
        expect(result.workload30).toBe(workloadCounts[30]);
        expect(result.workload40).toBe(workloadCounts[40]);
        expect(
            result.workload10 +
            result.workload20 +
            result.workload30 +
            result.workload40
        ).toBe(result.total);
    });

    test("контролируемое распределение пола при подмене Math.random", () => {
        const inputDto = { count: 5, age: { min: 20, max: 21 } };

        const originalRandom = Math.random;
        let callCounter = 0;
        const randomGroupSize = 5;
        const genderRandomSequence = [0.1, 0.9, 0.1, 0.9, 0.1];
        let genderIndex = 0;

        Math.random = () => {
            if (callCounter % randomGroupSize === 0) {
                const value = genderRandomSequence[genderIndex++];
                callCounter++;
                return value;
            }
            callCounter++;
            return 0.42;
        };

        try {
            const result = main(inputDto);
            const genders = result.sortedByWorkload.map((employee) => employee.gender);
            const maleCount = genders.filter((g) => g === "male").length;
            const femaleCount = genders.filter((g) => g === "female").length;

            expect(maleCount).toBe(3);
            expect(femaleCount).toBe(2);
        } finally {
            Math.random = originalRandom;
        }
    });

    test("валидация входных данных и сообщения об ошибках", () => {
        expect(() => main({})).toThrow("count musí být kladné celé číslo.");
        expect(() => main({ count: 0, age: { min: 19, max: 35 } })).toThrow();
        expect(() => main({ count: 3 })).toThrow("age musí být objekt { min, max }.");
        expect(() => main({ count: 3, age: { min: 'x', max: 20 } })).toThrow(
            "Neplatný rozsah age.min / age.max."
        );
        expect(() => main({ count: 3, age: { min: 30, max: 20 } })).toThrow(
            "Neplatný rozsah age.min / age.max."
        );
    });

    test("проверка границ по датам рождения (жёстче проверки возраста)", () => {
        const minAge = 20;
        const maxAge = 20;
        const result = main({ count: 10, age: { min: minAge, max: maxAge } });

        const currentDate = new Date();
        const oldestAllowedDate = new Date(currentDate);
        oldestAllowedDate.setUTCFullYear(currentDate.getUTCFullYear() - maxAge);

        const youngestAllowedDate = new Date(currentDate);
        youngestAllowedDate.setUTCFullYear(currentDate.getUTCFullYear() - minAge);

        for (const employee of result.sortedByWorkload) {
            const birthdate = new Date(employee.birthdate);
            expect(birthdate.getTime()).toBeGreaterThanOrEqual(oldestAllowedDate.getTime());
            expect(birthdate.getTime()).toBeLessThanOrEqual(youngestAllowedDate.getTime());
        }
    });

    test("medianWorkload кратен 10, а средний женский workload — в допустимых пределах", () => {
        const result = main({ count: 50, age: { min: 19, max: 35 } });

        expect(result.medianWorkload % 10).toBe(0);

        const hasFemaleEmployees = result.sortedByWorkload.some(
            (employee) => employee.gender === "female"
        );

        if (hasFemaleEmployees) {
            expect(result.averageWorkloadFemale).toBeGreaterThanOrEqual(10);
            expect(result.averageWorkloadFemale).toBeLessThanOrEqual(40);
        } else {
            expect(result.averageWorkloadFemale).toBe(0);
        }
    });
});
