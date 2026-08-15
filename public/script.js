document.addEventListener("DOMContentLoaded", () => {
    loadRecentRecords();
});

const calculateBtn = document.getElementById("calculateBtn") || document.querySelector("button");

function calculateAgeAndStats() {
    const nameInput = document.getElementById("userName") || document.querySelector("input[type='text']");
    const dobInput = document.getElementById("dob") || document.querySelector("input[type='date']");
    const statusMsg = document.getElementById("statusMessage") || document.getElementById("statusMsg");

    const name = nameInput ? nameInput.value.trim() : "Guest";
    const dobValue = dobInput ? dobInput.value : "";

    if (!dobValue) {
        if (statusMsg) {
            statusMsg.style.color = "#ff4d4d";
            statusMsg.innerText = "Please select a valid date of birth!";
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

    // Exact Age Calculation
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

    // Birth Year Type (Leap vs Standard)
    const birthYear = dob.getFullYear();
    const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
    const yearType = isLeap ? "Leap Year" : "Standard Year";

    // Zodiac Sign
    const zodiac = getZodiacSign(dob.getDate(), dob.getMonth() + 1);

    // Update UI Cards
    updateText("yearsVal", years);
    updateText("monthsVal", months);
    updateText("daysVal", days);
    updateText("zodiacVal", zodiac);
    updateText("totalDaysVal", totalDaysLived.toLocaleString());
    updateText("nextBdayVal", `${daysToNextBday} Days`);
    updateText("yearTypeVal", yearType);

    // Save record to LocalStorage (No Backend Error)
    saveRecordLocally({
        name: name || "Anonymous",
        dob: dobValue,
        zodiac: zodiac,
        days: totalDaysLived.toLocaleString()
    });

    if (statusMsg) {
        statusMsg.style.color = "#00ff88";
        statusMsg.innerText = "✓ Record calculated & saved!";
    }
}

function updateText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function getZodiacSign(day, month) {
    const signs = [
        { name: "Capricorn", maxDay: 19 },
        { name: "Aquarius", maxDay: 18 },
        { name: "Pisces", maxDay: 20 },
        { name: "Aries", maxDay: 19 },
        { name: "Taurus", maxDay: 20 },
        { name: "Gemini", maxDay: 20 },
        { name: "Cancer", maxDay: 22 },
        { name: "Leo", maxDay: 22 },
        { name: "Virgo", maxDay: 22 },
        { name: "Libra", maxDay: 22 },
        { name: "Scorpio", maxDay: 21 },
        { name: "Sagittarius", maxDay: 21 },
        { name: "Capricorn", maxDay: 31 }
    ];
    const monthIndex = month - 1;
    return day <= signs[monthIndex].maxDay ? (monthIndex === 0 ? "Capricorn" : signs[monthIndex - 1].name) : signs[monthIndex].name;
}

function saveRecordLocally(record) {
    let records = JSON.parse(localStorage.getItem("savedAgeRecords")) || [];
    records.unshift(record);
    if (records.length > 5) records.pop(); // Keep top 5
    localStorage.setItem("savedAgeRecords", JSON.stringify(records));
    renderRecordsTable(records);
}

function loadRecentRecords() {
    let records = JSON.parse(localStorage.getItem("savedAgeRecords")) || [];
    renderRecordsTable(records);
}

function renderRecordsTable(records) {
    const tableBody = document.getElementById("recordsTableBody") || document.querySelector("tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    records.forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${r.name}</td>
            <td>${r.dob}</td>
            <td>${r.zodiac}</td>
            <td>${r.days}</td>
        `;
        tableBody.appendChild(row);
    });
}

if (calculateBtn) {
    calculateBtn.addEventListener("click", calculateAgeAndStats);
}