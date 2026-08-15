document.addEventListener("DOMContentLoaded", () => {
    loadRecentRecords();

    const btn = document.getElementById("calculateBtn");
    if (btn) {
        btn.addEventListener("click", calculateAndSave);
    }
});

function calculateAndSave(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById("userName");
    const dobInput = document.getElementById("dob");
    const statusMsg = document.getElementById("statusMsg");

    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Adarsh Dixit";
    const dobValue = dobInput ? dobInput.value : "";

    if (!dobValue) {
        if (statusMsg) {
            statusMsg.style.color = "#f87171";
            statusMsg.innerText = "Please select your date of birth!";
        }
        return;
    }

    const dob = new Date(dobValue);
    const today = new Date();

    if (dob > today) {
        if (statusMsg) {
            statusMsg.style.color = "#f87171";
            statusMsg.innerText = "Date of birth cannot be in the future!";
        }
        return;
    }

    // Exact Age Calculation (Years, Months, Days)
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

    // Next Birthday Countdown
    let nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (today > nextBday) {
        nextBday.setFullYear(today.getFullYear() + 1);
    }
    const daysToNextBday = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

    // Birth Year Type (Leap / Standard)
    const birthYear = dob.getFullYear();
    const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
    const yearType = isLeap ? "Leap Year" : "Standard Year";

    // Zodiac Sign
    const zodiac = getZodiac(dob.getDate(), dob.getMonth() + 1);

    // Update UI Stats
    document.getElementById("yearsVal").innerText = years;
    document.getElementById("monthsVal").innerText = months;
    document.getElementById("daysVal").innerText = days;
    document.getElementById("zodiacVal").innerText = zodiac;
    document.getElementById("totalDaysVal").innerText = totalDaysLived.toLocaleString();
    document.getElementById("nextBdayVal").innerText = `${daysToNextBday} Days`;
    document.getElementById("yearTypeVal").innerText = yearType;

    // Save in LocalStorage
    saveRecord({
        name: name,
        dob: dobValue,
        zodiac: zodiac,
        days: totalDaysLived.toLocaleString()
    });

    if (statusMsg) {
        statusMsg.style.color = "#34d399";
        statusMsg.innerText = "✓ Record calculated & saved!";
    }
}

function getZodiac(day, month) {
    const cutoff = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
    const signs = [
        "Capricorn", "Aquarius", "Pisces", "Aries", 
        "Taurus", "Gemini", "Cancer", "Leo", 
        "Virgo", "Libra", "Scorpio", "Sagittarius"
    ];
    return day <= cutoff[month - 1] ? signs[month - 1] : signs[month % 12];
}

function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem("ageAppRecords") || "[]");
    records.unshift(record);
    if (records.length > 5) records.pop();
    localStorage.setItem("ageAppRecords", JSON.stringify(records));
    renderRecordsTable(records);
}

function loadRecentRecords() {
    let records = JSON.parse(localStorage.getItem("ageAppRecords") || "[]");
    renderRecordsTable(records);
}

function renderRecordsTable(records) {
    const tbody = document.getElementById("recordsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">No records yet</td></tr>`;
        return;
    }

    records.forEach(r => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="color:#f8fafc; font-weight:600;">${r.name}</td>
            <td style="color:#94a3b8;">${r.dob}</td>
            <td style="color:#38bdf8; font-weight:600;">${r.zodiac}</td>
            <td style="color:#34d399; font-weight:600;">${r.days}</td>
        `;
        tbody.appendChild(row);
    });
}