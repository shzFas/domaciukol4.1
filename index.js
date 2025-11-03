function validateDtoIn(dtoIn) {
    const { count, age } = dtoIn;
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error("count musí být kladné celé číslo.");
    }
    if (!age || typeof age !== "object") {
        throw new Error("age musí být objekt { min, max }.");
    }
    const minAge = Number(age.min);
    const maxAge = Number(age.max);
    if (
        !Number.isFinite(minAge) ||
        !Number.isFinite(maxAge) ||
        minAge < 0 ||
        maxAge < 0 ||
        minAge > maxAge
    ) {
        throw new Error("Neplatný rozsah age.min / age.max.");
    }
}

const WORKLOADS = [10, 20, 30, 40];

const maleFirstNames = [
    "Adam", "Aleš", "Bohdan", "Daniel", "David", "Filip", "Hynek", "Ivan", "Jan", "Jindřich",
    "Karel", "Ladislav", "Lukáš", "Marek", "Martin", "Matěj", "Milan", "Ondřej", "Pavel", "Petr", "Tomáš"
];
const femaleFirstNames = [
    "Adéla", "Alena", "Anna", "Barbora", "Dana", "Denisa", "Eliška", "Eva", "Hana", "Ivana",
    "Jana", "Jitka", "Kateřina", "Klára", "Lucie", "Marie", "Markéta", "Petra", "Tereza", "Veronika"
];
const surnamesMale = [
    "Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec", "Pokorný",
    "Hájek", "Král", "Fiala", "Kříž", "Beneš", "Sedláček", "Zeman", "Kolář", "Urban", "Bláha"
];
const surnamesFemale = [
    "Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková", "Kučerová", "Veselá", "Horáková",
    "Němcová", "Pokorná", "Hájková", "Králová", "Fialová", "Křížová", "Benešová", "Sedláčková",
    "Zemanová", "Kolářová", "Urbanová", "Bláhová"
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const yearsAgo = (years) => {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - years);
    return d;
};
const randomDateBetween = (start, end) => {
    const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(t);
};
const toIso = (d) => d.toISOString();

function ageFromBirthdateISO(birthISO) {
    const now = Date.now();
    const t = new Date(birthISO).getTime();
    return (now - t) / (365.2425 * 24 * 60 * 60 * 1000);
}

function average(nums) {
    if (!nums.length) return 0;
    return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function median(numbers) {
    if (numbers.length === 0) return 0;
    const arr = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
}

function round2(n) {
    return Math.round(n * 100) / 100;
}

function generateEmployeeData(dtoIn) {
    const { count, age } = dtoIn;
    const maxDob = yearsAgo(Number(age.min));
    const minDob = yearsAgo(Number(age.max));

    const list = [];
    for (let i = 0; i < count; i++) {
        const gender = Math.random() < 0.5 ? "male" : "female";
        const name = gender === "male" ? pick(maleFirstNames) : pick(femaleFirstNames);
        const surname = gender === "male" ? pick(surnamesMale) : pick(surnamesFemale);
        const workload = pick(WORKLOADS);
        const birthdate = toIso(randomDateBetween(minDob, maxDob));

        list.push({
            gender,
            birthdate,
            name,
            surname,
            workload
        });
    }
    return list;
}

function getEmployeeStatistics(employees) {
    const total = employees.length;

    let workload10 = 0, workload20 = 0, workload30 = 0, workload40 = 0;

    const ages = [];
    let minAge = Infinity;
    let maxAge = -Infinity;

    let femaleWorkloadSum = 0;
    let femaleCount = 0;

    for (const e of employees) {
        if (e.workload === 10) workload10++;
        else if (e.workload === 20) workload20++;
        else if (e.workload === 30) workload30++;
        else if (e.workload === 40) workload40++;

        const a = ageFromBirthdateISO(e.birthdate);
        ages.push(a);
        if (a < minAge) minAge = a;
        if (a > maxAge) maxAge = a;

        if (e.gender === "female") {
            femaleWorkloadSum += e.workload;
            femaleCount++;
        }
    }

    const averageAge = round2(average(ages));
    const medianAge = round2(median(ages));
    const medianWorkload = median(employees.map(e => e.workload));
    const averageWorkloadFemale = femaleCount ? round2(femaleWorkloadSum / femaleCount) : 0;

    const sortedByWorkload = [...employees].sort((a, b) => a.workload - b.workload);

    return {
        total,
        workload10,
        workload20,
        workload30,
        workload40,
        averageAge,
        minAge: round2(minAge),
        maxAge: round2(maxAge),
        medianAge,
        medianWorkload,
        averageWorkloadFemale,
        sortedByWorkload
    };
}

function main(dtoIn = {}) {
    validateDtoIn(dtoIn);

    const employees = generateEmployeeData(dtoIn);
    const stats = getEmployeeStatistics(employees);
    return stats;
}

const dtoIn = { count: 10, age: { min: 19, max: 35 } };
console.log(main(dtoIn));

module.exports = {
    main,
    generateEmployeeData,
    getEmployeeStatistics
};
