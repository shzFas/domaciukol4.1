function validateDtoIn(inputDto) {
    const { count, age } = inputDto;
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error("count musí být kladné celé číslo.");
    }
    if (!age || typeof age !== "object") {
        throw new Error("age musí být objekt { min, max }.");
    }

    const minimumAge = Number(age.min);
    const maximumAge = Number(age.max);

    const isInvalid =
        !Number.isFinite(minimumAge) ||
        !Number.isFinite(maximumAge) ||
        minimumAge < 0 ||
        maximumAge < 0 ||
        minimumAge > maximumAge;

    if (isInvalid) {
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
const maleSurnames = [
    "Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec", "Pokorný",
    "Hájek", "Král", "Fiala", "Kříž", "Beneš", "Sedláček", "Zeman", "Kolář", "Urban", "Bláha"
];
const femaleSurnames = [
    "Nováková", "Svobodová", "Dvořáková", "Černá", "Procházková", "Kučerová", "Veselá", "Horáková",
    "Němcová", "Pokorná", "Hájková", "Králová", "Fialová", "Křížová", "Benešová", "Sedláčková",
    "Zemanová", "Kolářová", "Urbanová", "Bláhová"
];

const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];

const yearsAgo = (years) => {
    const date = new Date();
    date.setUTCFullYear(date.getUTCFullYear() - years);
    return date;
};

const getRandomDateBetween = (startDate, endDate) => {
    const time = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(time);
};

const toIsoString = (date) => date.toISOString();

/* возраст от даты рождения */
function getAgeFromBirthdate(birthdateIso) {
    const now = Date.now();
    const birthTime = new Date(birthdateIso).getTime();
    const yearsPassed = (now - birthTime) / (365.2425 * 24 * 60 * 60 * 1000);
    return yearsPassed;
}

/* средний */
function getAverage(values) {
    if (values.length === 0) return 0;
    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
}

/* медиана */
function getMedian(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middleIndex = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[middleIndex - 1] + sorted[middleIndex]) / 2
        : sorted[middleIndex];
}

function roundToTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}

function generateEmployeeData(inputDto) {
    const { count, age } = inputDto;
    const maximumBirthDate = yearsAgo(Number(age.min)); // моложе
    const minimumBirthDate = yearsAgo(Number(age.max)); // старше

    const employees = [];

    for (let i = 0; i < count; i++) {
        const gender = Math.random() < 0.5 ? "male" : "female";
        const firstName = gender === "male" ? pickRandom(maleFirstNames) : pickRandom(femaleFirstNames);
        const surname = gender === "male" ? pickRandom(maleSurnames) : pickRandom(femaleSurnames);
        const workload = pickRandom(WORKLOADS);
        const birthdate = toIsoString(getRandomDateBetween(minimumBirthDate, maximumBirthDate));

        employees.push({
            gender,
            birthdate,
            name: firstName,
            surname,
            workload
        });
    }

    return employees;
}

function getEmployeeStatistics(employeeList) {
    const totalEmployees = employeeList.length;

    let workload10Count = 0;
    let workload20Count = 0;
    let workload30Count = 0;
    let workload40Count = 0;

    const allAges = [];
    let minimumAge = Infinity;
    let maximumAge = -Infinity;

    let femaleWorkloadSum = 0;
    let femaleEmployeeCount = 0;

    for (const employee of employeeList) {
        // счетчики рабочей нагрузки
        if (employee.workload === 10) workload10Count++;
        else if (employee.workload === 20) workload20Count++;
        else if (employee.workload === 30) workload30Count++;
        else if (employee.workload === 40) workload40Count++;

        // статистика по возрасту
        const currentAge = getAgeFromBirthdate(employee.birthdate);
        allAges.push(currentAge);
        if (currentAge < minimumAge) minimumAge = currentAge;
        if (currentAge > maximumAge) maximumAge = currentAge;

        // женская рабочая нагрузка
        if (employee.gender === "female") {
            femaleWorkloadSum += employee.workload;
            femaleEmployeeCount++;
        }
    }

    const averageAge = roundToTwoDecimals(getAverage(allAges));
    const medianAge = roundToTwoDecimals(getMedian(allAges));
    const medianWorkload = getMedian(employeeList.map(emp => emp.workload));
    const averageFemaleWorkload = femaleEmployeeCount
        ? roundToTwoDecimals(femaleWorkloadSum / femaleEmployeeCount)
        : 0;

    const employeesSortedByWorkload = [...employeeList].sort((a, b) => a.workload - b.workload);

    return {
        total: totalEmployees,
        workload10: workload10Count,
        workload20: workload20Count,
        workload30: workload30Count,
        workload40: workload40Count,
        averageAge,
        minAge: roundToTwoDecimals(minimumAge),
        maxAge: roundToTwoDecimals(maximumAge),
        medianAge,
        medianWorkload,
        averageWorkloadFemale: averageFemaleWorkload,
        sortedByWorkload: employeesSortedByWorkload
    };
}

function main(inputDto = {}) {
    validateDtoIn(inputDto);
    const employees = generateEmployeeData(inputDto);
    const statistics = getEmployeeStatistics(employees);
    return statistics;
}

const dtoIn = { count: 10, age: { min: 19, max: 35 } };
console.log(main(dtoIn));

module.exports = {
    main,
    generateEmployeeData,
    getEmployeeStatistics,
    validateDtoIn
};
