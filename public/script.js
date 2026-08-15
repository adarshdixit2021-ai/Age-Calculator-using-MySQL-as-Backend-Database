document.addEventListener("DOMContentLoaded", () => {
    loadRecords();

    // Attach click listener to the button
    const btn = document.querySelector("button") || document.getElementById("calculateBtn");
    if (btn) {
        btn.addEventListener("click", handleCalculate);
    }
});

function handleCalculate(e) {
    if (e) e.preventDefault();

    // 1. Get Inputs
    const nameInput = document.querySelector("input[type='text']") || document.getElementById("name");
    const dobInput = document.querySelector("input[type='date']") || document.getElementById("dob");

    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Guest";
    const dobValue = dobInput ? dobInput.value : "";

    if (!dobValue) {
        alert("Please select a date of birth!");
        return;
    }

    const dob = new Date(dobValue);
    const today = new Date();

    if (dob > today) {
        alert("Date of birth cannot be in the future!");
        return;
    }

    // 2. Exact Age Calculation
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Total Days Lived
    const diffTime = Math.abs(today - dob);
    const totalDaysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Next Birthday Countdown
    let nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (today > nextBday) {
        nextBday.setFullYear(today.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

    // Birth Year Type
    const birthYear = dob.getFullYear();
    const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
    const yearType = isLeap ? "Leap Year" : "Standard Year";

    // Zodiac Sign Calculation
    const zodiac = getZodiac(dob.getDate(), dob.getMonth() + 1);

    // 3. Update Result Card Values
    setCardValue("YEARS", years);
    setCardValue("MONTHS", months);
    setCardValue("DAYS", days);
    setCardValue("ZODIAC SIGN", zodiac);
    setCardValue("TOTAL DAYS LIVED", totalDaysLived.toLocaleString());
    setCardValue("NEXT BIRTHDAY", `${daysToNextBday} Days`);
    setCardValue("BIRTH YEAR TYPE", yearType);

    // 4. Save to Local Storage
    const newRecord = {
        name: name,
        dob: dobValue,
        zodiac: zodiac,
        days: totalDaysLived.toLocaleString()
    };

    let records = JSON.parse(localStorage.getItem("ageCalculatorRecords") || "[]");
    records.unshift(newRecord);
    if (records.length > 5) records.pop();
    localStorage.setItem("ageCalculatorRecords", JSON.stringify(records));

    // 5. Render Table
    renderTable(records);
}

function setCardValue(labelMatch, value) {
    const allCards = document.querySelectorAll("div, p, span, h1, h2, h3, h4");
    for (let el of allCards) {
        if (el.children.length === 0 && el.innerText.trim().toUpperCase() === labelMatch) {
            const parent = el.parentElement;
            if (parent) {
                const valueElem = parent.querySelector("h1, h2, h3, h4, .val, .value, span, strong") || parent.children[0];
                if (valueElem && valueElem !== el) {
                    valueElem.innerText = value;
                    return;
                }
            }
        }
    }
}

function getZodiac(day, month) {
    const days = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 22, 22];
    const signs = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"];
    return day < days[month - 1] ? signs[month - 1] : signs[month];
}

function loadRecords() {
    const records = JSON.parse(localStorage.getItem("ageCalculatorRecords") || "[]");
    renderTable(records);
}

function renderTable(records) {
    // Find tbody or records container
    let tbody = document.querySelector("tbody");
    
    if (!tbody) {
        // If table doesn't have tbody, look for table or record list container
        const table = document.querySelector("table");
        if (table) {
            tbody = document.createElement("tbody");
            table.appendChild(tbody);
        }
    }

    if (tbody) {
        tbody.innerHTML = "";
        records.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="padding: 8px; color: #fff; font-size: 0.85rem;">${r.name}</td>
                <td style="padding: 8px; color: #a0aec0; font-size: 0.85rem;">${r.dob}</td>
                <td style="padding: 8px; color: #38bdf8; font-size: 0.85rem;">${r.zodiac}</td>
                <td style="padding: 8px; color: #34d399; font-size: 0.85rem;">${r.days}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}