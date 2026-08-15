document.addEventListener("DOMContentLoaded", () => {
    loadRecentRecords();

    const calculateBtn = document.getElementById("calculateBtn");
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateAge);
    }
});

function calculateAge(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById("userName");
    const dobInput = document.getElementById("dob");
    const statusMsg = document.getElementById("statusMsg");

    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Adarsh";
    const dobValue = dobInput ? dobInput.value : "";

    if (!dobValue) {
        if (statusMsg) {
            statusMsg.style.color = "#ff4d4d";
            statusMsg.innerText = "Please select a date of birth!";
        }
        return;
    }

    const dob = new Date(dobValue);
    const today = new Date();

    if (dob > today) {
        if (statusMsg) {
            statusMsg.style.color = "#ff4d4d";
            statusMsg.innerText = "Date of birth cannot be in the future!";
        }
        return;
    }

    // Age in Years, Months, Days
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonthDays;
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    // Total Days Lived
    const diffTime = Math.abs(today - dob);
    const totalDaysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Next Birthday
    let nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (today > nextBday) {
        nextBday.setFullYear(today.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

    // Birth Year Type
    const birthYear = dob.getFullYear();
    const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
    const yearType = isLeap ? "Leap Year" : "Standard Year";

    // Zodiac Sign
    const zodiac = getZodiacSign(dob.getDate(), dob.getMonth() + 1);

    // Update Display Cards
    document.getElementById("yearsVal").innerText = years;
    document.getElementById("monthsVal").innerText = months;
    document.getElementById("daysVal").innerText = days;
    document.getElementById("zodiacVal").innerText = zodiac;
    document.getElementById("totalDaysVal").innerText = totalDaysLived.toLocaleString();
    document.getElementById("nextBdayVal").innerText = `${daysToNextBday} Days`;
    document.getElementById("yearTypeVal").innerText = yearType;

    // Save and Render Table
    saveRecordLocally({
        name: name,
        dob: dobValue,
        zodiac: zodiac,
        days: totalDaysLived.toLocaleString()
    });

    if (statusMsg) {
        statusMsg.style.color = "#00ff88";
        statusMsg.innerText = "✓ Record calculated & saved!";
    }
}

function getZodiacSign(day, month) {
    const signs = [
        { name: "Capricorn", max: 19 },
        { name: "Aquarius", max: 18 },
        { name: "Pisces", max: 20 },
        { name: "Aries", max: 19 },
        { name: "Taurus", max: 20 },
        { name: "Gemini", max: 20 },
        { name: "Cancer", max: 22 },
        { name: "Leo", max: 22 },
        { name: "Virgo", max: 22 },
        { name: "Libra", max: 22 },
        { name: "Scorpio", max: 21 },
        { name: "Sagittarius", max: 21 },
        { name: "Capricorn", max: 31 }
    ];
    return day <= signs[month - 1].max ? (month === 1 ? "Capricorn" : signs[month - 2].name) : signs[month - 1].name;
}

function saveRecordLocally(record) {
    let records = JSON.parse(localStorage.getItem("ageCalcRecords") || "[]");
    records.unshift(record);
    if (records.length > 5) records.pop();
    localStorage.setItem("ageCalcRecords", JSON.stringify(records));
    renderRecordsTable(records);
}

function loadRecentRecords() {
    let records = JSON.parse(localStorage.getItem("ageCalcRecords") || "[]");
    renderRecordsTable(records);
}

function renderRecordsTable(records) {
    const tbody = document.getElementById("recordsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    records.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.dob}</td>
            <td style="color: #38bdf8;">${item.zodiac}</td>
            <td style="color: #34d399;">${item.days}</td>
        `;
        tbody.appendChild(row);
    });
}