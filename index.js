function main(dtoIn = {}) {
    const { count, age } = dtoIn;
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error("count musí být kladné celé číslo.");
    }
    if (!age || typeof age !== "object") {
        throw new Error("age musí být objekt { min, max }.");
    }
    const minAge = Number(age.min);
    const maxAge = Number(age.max);
    if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 0 || maxAge < 0 || minAge > maxAge) {
        throw new Error("Neplatný rozsah age.min / age.max.");
    }

    // Data
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
    const WORKLOADS = [10, 20, 30, 40];

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

    // Rozmezí dat narození podle věku
    const maxDob = yearsAgo(minAge);
    const minDob = yearsAgo(maxAge);

    // --- Generation ---
    const dtoOut = [];
    for (let i = 0; i < count; i++) {
        const gender = Math.random() < 0.5 ? "male" : "female";
        const name = gender === "male" ? pick(maleFirstNames) : pick(femaleFirstNames);
        const surname = gender === "male" ? pick(surnamesMale) : pick(surnamesFemale);
        const workload = pick(WORKLOADS);
        const birthdateISO = randomDateBetween(minDob, maxDob).toISOString();

        dtoOut.push({
            gender,
            birthdate: birthdateISO,
            name,
            surname,
            workload
        });
    }

    return dtoOut;
}

const dtoIn = { count: 10, age: { min: 19, max: 35 } };
console.log(main(dtoIn));

module.exports = { main };
