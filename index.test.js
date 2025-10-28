const { main } = require("./index");

const isIsoString = (s) => {
    try {
        return new Date(s).toISOString() === s;
    } catch {
        return false;
    }
};

const ageFromDob = (iso) => {
    const dob = new Date(iso);
    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const m = today.getUTCMonth() - dob.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < dob.getUTCDate())) age--;
    return age;
};

function withMockedRandom(sequence, fn) {
    const orig = Math.random;
    let i = 0;
    Math.random = () => {
        const val = sequence[i % sequence.length];
        i++;
        return val;
    };
    try {
        return fn();
    } finally {
        Math.random = orig;
    }
}

describe("main(dtoIn) — generátor zaměstnanců", () => {
    test("vrací přesný počet záznamů a správnou strukturu polí", () => {
        const out = main({ count: 7, age: { min: 19, max: 35 } });
        expect(Array.isArray(out)).toBe(true);
        expect(out).toHaveLength(7);
        for (const emp of out) {
            expect(Object.keys(emp).sort()).toEqual(
                ["birthdate", "gender", "name", "surname", "workload"].sort()
            );
        }
    });

    test("gender je vždy 'male' nebo 'female' a workload je z {10,20,30,40}", () => {
        const out = main({ count: 30, age: { min: 20, max: 30 } });
        const allowedW = new Set([10, 20, 30, 40]);
        for (const emp of out) {
            expect(["male", "female"]).toContain(emp.gender);
            expect(allowedW.has(emp.workload)).toBe(true);
        }
    });

    test("birthdate je v ISO formátu a věk spadá do zadaného intervalu (vč. hranic)", () => {
        const min = 19, max = 35;
        const out = main({ count: 25, age: { min, max } });
        for (const emp of out) {
            expect(isIsoString(emp.birthdate)).toBe(true);
            const age = ageFromDob(emp.birthdate);
            expect(age).toBeGreaterThanOrEqual(min);
            expect(age).toBeLessThanOrEqual(max);
        }
    });

    test("deterministicky: střídání pohlaví (gender volání každých 5 náhod)", () => {
        const dtoIn = { count: 5, age: { min: 20, max: 21 } };

        const origRandom = Math.random;
        let call = 0;
        const groupSize = 5;
        const genderSeq = [0.1, 0.9, 0.1, 0.9, 0.1];
        let genderIdx = 0;

        Math.random = () => {
            if (call % groupSize === 0) {
                const v = genderSeq[genderIdx++];
                call++;
                return v;
            }
            call++;
            return 0.42;
        };

        try {
            const out = main(dtoIn);
            expect(out.map(e => e.gender)).toEqual(["male", "female", "male", "female", "male"]);
            for (const e of out) expect([10, 20, 30, 40]).toContain(e.workload);
        } finally {
            Math.random = origRandom;
        }
    });


    test("vyhazuje chybu na neplatný vstup (count, age, min/max)", () => {
        expect(() => main({})).toThrow("count musí být kladné celé číslo.");
        expect(() => main({ count: 0, age: { min: 19, max: 35 } })).toThrow();
        expect(() => main({ count: 3 })).toThrow("age musí být objekt { min, max }.");
        expect(() => main({ count: 3, age: { min: "x", max: 20 } })).toThrow(
            "Neplatný rozsah age.min / age.max."
        );
        expect(() => main({ count: 3, age: { min: 30, max: 20 } })).toThrow(
            "Neplatný rozsah age.min / age.max."
        );
    });

    test("birthdate действительно в промежутке по датам (проверка сильнее, чем возраст)", () => {
        const min = 20, max = 20;
        const out = main({ count: 10, age: { min, max } });

        const now = new Date();
        const minDob = new Date(now); minDob.setUTCFullYear(now.getUTCFullYear() - max);
        const maxDob = new Date(now); maxDob.setUTCFullYear(now.getUTCFullYear() - min);

        for (const e of out) {
            const d = new Date(e.birthdate);
            expect(d.getTime()).toBeGreaterThanOrEqual(minDob.getTime());
            expect(d.getTime()).toBeLessThanOrEqual(maxDob.getTime());
        }
    });
});
