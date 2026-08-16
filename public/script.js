document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-hide download button inside Android App
    const downloadSection = document.querySelector('.app-download-container') || document.getElementById('downloadAppSection');
    if (downloadSection && (window.location.protocol === 'file:' || navigator.userAgent.includes('wv'))) {
        downloadSection.style.display = 'none';
    }

    // 2. DOM Elements
    const calcBtn = document.getElementById('calcBtn');
    const nameInput = document.getElementById('userName');
    const dobInput = document.getElementById('dobInput');
    const errorMsg = document.getElementById('errorMsg');

    const resYears = document.getElementById('resYears');
    const resMonths = document.getElementById('resMonths');
    const resDays = document.getElementById('resDays');
    const resZodiac = document.getElementById('resZodiac');
    const resTotalDays = document.getElementById('resTotalDays');
    const resNextBday = document.getElementById('resNextBday');
    const resYearType = document.getElementById('resYearType');

    const recordsBody = document.getElementById('recordsBody');
    const noRecordsMsg = document.getElementById('noRecordsMsg');

    loadRecords();

    if (calcBtn) {
        calcBtn.addEventListener('click', calculateAge);
    }

    function calculateAge() {
        const name = nameInput.value.trim() || 'Anonymous';
        const dobVal = dobInput.value;

        if (!dobVal) {
            if (errorMsg) errorMsg.textContent = 'Please select a valid date of birth!';
            return;
        }

        const dob = new Date(dobVal);
        const today = new Date();

        if (dob > today) {
            if (errorMsg) errorMsg.textContent = 'Date of birth cannot be in the future!';
            return;
        }

        if (errorMsg) errorMsg.textContent = '';

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

        const timeDiff = today.getTime() - dob.getTime();
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const zodiac = getZodiacSign(dob.getDate(), dob.getMonth() + 1);
        const nextBdayDays = getNextBirthdayDays(dob, today);

        const birthYear = dob.getFullYear();
        const isLeap = (birthYear % 4 === 0 && birthYear % 100 !== 0) || (birthYear % 400 === 0);
        const yearType = isLeap ? 'Leap Year' : 'Normal Year';

        if (resYears) resYears.textContent = years;
        if (resMonths) resMonths.textContent = months;
        if (resDays) resDays.textContent = days;
        if (resZodiac) resZodiac.textContent = zodiac;
        if (resTotalDays) resTotalDays.textContent = totalDays.toLocaleString();
        if (resNextBday) resNextBday.textContent = nextBdayDays === 0 ? 'Today! 🎉' : `${nextBdayDays} Days`;
        if (resYearType) resYearType.textContent = yearType;

        saveRecord(name, dobVal, zodiac, totalDays);
    }

    function getZodiacSign(day, month) {
        const signs = [
            { sign: 'Capricorn', m: 1, d: 20 },
            { sign: 'Aquarius', m: 2, d: 19 },
            { sign: 'Pisces', m: 3, d: 20 },
            { sign: 'Aries', m: 4, d: 20 },
            { sign: 'Taurus', m: 5, d: 21 },
            { sign: 'Gemini', m: 6, d: 21 },
            { sign: 'Cancer', m: 7, d: 22 },
            { sign: 'Leo', m: 8, d: 23 },
            { sign: 'Virgo', m: 9, d: 23 },
            { sign: 'Libra', m: 10, d: 23 },
            { sign: 'Scorpio', m: 11, d: 22 },
            { sign: 'Sagittarius', m: 12, d: 21 }
        ];

        for (let i = 0; i < signs.length; i++) {
            if (month === signs[i].m && day <= signs[i].d) return signs[i].sign;
        }
        return 'Capricorn';
    }

    function getNextBirthdayDays(dob, today) {
        let nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (today > nextBday) {
            nextBday.setFullYear(today.getFullYear() + 1);
        }
        const diff = nextBday.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    function saveRecord(name, dob, zodiac, days) {
        let records = JSON.parse(localStorage.getItem('age_calc_records') || '[]');
        records.unshift({ name, dob, zodiac, days: days.toLocaleString() });
        if (records.length > 10) records.pop();
        localStorage.setItem('age_calc_records', JSON.stringify(records));
        renderRecords(records);
    }

    function loadRecords() {
        let records = JSON.parse(localStorage.getItem('age_calc_records') || '[]');
        renderRecords(records);
    }

    function renderRecords(records) {
        if (!recordsBody) return;
        recordsBody.innerHTML = '';

        if (records.length === 0) {
            if (noRecordsMsg) noRecordsMsg.style.display = 'block';
            return;
        }

        if (noRecordsMsg) noRecordsMsg.style.display = 'none';

        records.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(item.name)}</td>
                <td>${item.dob}</td>
                <td>${item.zodiac}</td>
                <td>${item.days}</td>
            `;
            recordsBody.appendChild(row);
        });
    }

    function escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
});
