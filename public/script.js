// Zodiac Sign Calculation
function getZodiacSign(day, month) {
    const signs = [
        { sign: "Capricorn", m: 1, d: 20 }, { sign: "Aquarius", m: 2, d: 19 },
        { sign: "Pisces", m: 3, d: 20 }, { sign: "Aries", m: 4, d: 20 },
        { sign: "Taurus", m: 5, d: 21 }, { sign: "Gemini", m: 6, d: 21 },
        { sign: "Cancer", m: 7, d: 22 }, { sign: "Leo", m: 8, d: 23 },
        { sign: "Virgo", m: 9, d: 23 }, { sign: "Libra", m: 10, d: 23 },
        { sign: "Scorpio", m: 11, d: 22 }, { sign: "Sagittarius", m: 12, d: 21 },
        { sign: "Capricorn", m: 12, d: 31 }
    ];
    for (let i = 0; i < signs.length; i++) {
        if (month === signs[i].m && day <= signs[i].d) return signs[i].sign;
        if (month === signs[i].m && day > signs[i].d && signs[i + 1]) return signs[i + 1].sign;
    }
    return "Capricorn";
}

// Fetch & Load Table Records
async function loadRecords() {
    try {
        const response = await fetch('/api/records');
        if (!response.ok) return;
        const data = await response.json();
        const tbody = document.getElementById('recordsBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; opacity:0.6;">No records found</td></tr>';
            return;
        }

        data.forEach(item => {
            const dateObj = new Date(item.dob);
            const formattedDate = dateObj.toLocaleDateString('en-GB');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${formattedDate}</td>
                <td>${item.zodiac_sign || '-'}</td>
                <td>${item.total_days_lived ? Number(item.total_days_lived).toLocaleString() : '-'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading records:', err);
    }
}

// Page Load Event
document.addEventListener('DOMContentLoaded', () => {
    loadRecords();

    const calculateBtn = document.getElementById('calculateBtn');
    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', async () => {
        const nameInput = document.getElementById('userName').value.trim();
        const dobInput = document.getElementById('userDob').value;
        const statusMsg = document.getElementById('statusMessage');

        if (!nameInput || !dobInput) {
            statusMsg.className = 'status-msg error';
            statusMsg.innerText = '⚠️ Please enter both Name and Date of Birth!';
            return;
        }

        const birthDate = new Date(dobInput);
        const today = new Date();

        if (birthDate > today) {
            statusMsg.className = 'status-msg error';
            statusMsg.innerText = '⚠️ Birth date cannot be in the future!';
            return;
        }

        // Age Calculation
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

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
        const diffTime = Math.abs(today - birthDate);
        const totalDaysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Zodiac Sign Calculation
        const bMonth = birthDate.getMonth() + 1;
        const bDay = birthDate.getDate();
        const zodiac = getZodiacSign(bDay, bMonth);

        // Leap Year Check
        const birthYear = birthDate.getFullYear();
        const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);

        // Next Birthday Countdown
        const nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBday) {
            nextBday.setFullYear(today.getFullYear() + 1);
        }
        const daysToNextBday = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));

        // Render UI Results
        document.getElementById('yearsVal').innerText = years;
        document.getElementById('monthsVal').innerText = months;
        document.getElementById('daysVal').innerText = days;
        document.getElementById('zodiacVal').innerText = zodiac;
        document.getElementById('totalDaysVal').innerText = totalDaysLived.toLocaleString();
        document.getElementById('nextBirthdayVal').innerText = `${daysToNextBday} Days`;
        document.getElementById('yearTypeVal').innerText = isLeap ? 'Leap Year' : 'Standard Year';

        document.getElementById('resultSection').style.display = 'grid';

        // Save to Backend Database
        statusMsg.className = 'status-msg';
        statusMsg.innerText = 'Saving record to database...';

        try {
            const response = await fetch('/api/save-record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput,
                    dob: dobInput,
                    zodiac_sign: zodiac,
                    total_days_lived: totalDaysLived
                })
            });

            const data = await response.json();
            if (response.ok) {
                statusMsg.className = 'status-msg success';
                statusMsg.innerText = '✓ Saved successfully to MySQL database!';
                loadRecords(); // Auto-refresh recent records table
            } else {
                statusMsg.className = 'status-msg error';
                statusMsg.innerText = '✗ Database error: ' + (data.error || 'Failed to save');
            }
        } catch (err) {
            statusMsg.className = 'status-msg error';
            statusMsg.innerText = '✗ Server connection failed.';
        }
    });
});