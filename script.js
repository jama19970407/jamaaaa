let lastBettingTime = 0; 
let tokenIndex = 0;

const tokens = [
    "demo",
    "demo",
    "demo"
];

function getAuthorizationToken() {
    const token = tokens[tokenIndex];
    tokenIndex = (tokenIndex + 1) % tokens.length;
    return `Bearer ${token}`;
}

function getRan(min, max) {
    return Math.random() * (max - min) + min;
}

async function checkSignal() {
    let randomNumber1 = getRan(1.1, 5.0).toFixed(2);
    const url = 'https://crash-gateway-cr.100hp.app/state?id_n=1play_luckyjet';
    const response = await fetch(url, {
        headers: {
            'Authorization': getAuthorizationToken()
        }
    });
    const data = await response.json();
    const state = data.current_state;


    let responseText = document.getElementById('responseText');
    if (!responseText) {
        console.error('Element with ID responseText not found.');
        return;
    }

    if (state === "betting" && Date.now() - lastBettingTime > 5000) {
        let resultText = `${randomNumber1}x`;
        document.getElementById("responseText").textContent = resultText;
        localStorage.setItem('resultText', resultText);
        responseText.className = 'text betting';        
        lastBettingTime = Date.now();
    } else if (state === "ending") {
        responseText.textContent = "Waiting..";
        responseText.className = 'text fly';
    } 
}

function fetchDataAndUpdate() {
    const url = 'https://crash-gateway-cr.100hp.app/state?id_n=1play_luckyjet';
    fetch(url, {
        headers: {
            'Authorization': getAuthorizationToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            const kef = parseFloat(data.current_coefficients);
            updateCoefficients(kef);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateCoefficients(coefficients) {

    const coefficientsDiv = document.getElementById('coefficients');
    

    if (coefficients !== 1) {
        coefficientsDiv.innerText = `x${coefficients}`; 
        coefficientsDiv.classList.remove('smallt');
        coefficientsDiv.classList.add('kif');
        
        
        
    } 
}
function fadeIn() {
    const preloader = document.querySelector(".preloader")
    setTimeout(() => {
      preloader.classList.add("hidden")
      preloader.style.display = "none"
      document.body.classList.remove("hidden")
      document.body.classList.add("fade-in")
    }, 1700)
  }

fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 100);
fadeIn();
let intervalId = setInterval(checkSignal, 100);
checkSignal();

// Generate realistic coefficient based on real game statistics
function generateRealisticCoefficient() {
    const random = Math.random() * 100;
    
    if (random < 60) {
        // 60% chance: 1.0x - 2.0x (most common)
        return (Math.random() * (2.0 - 1.01) + 1.01).toFixed(2);
    } else if (random < 85) {
        // 25% chance: 2.0x - 5.0x (common)
        return (Math.random() * (5.0 - 2.0) + 2.0).toFixed(2);
    } else if (random < 95) {
        // 10% chance: 5.0x - 10.0x (rare)
        return (Math.random() * (10.0 - 5.0) + 5.0).toFixed(2);
    } else {
        // 5% chance: 10.0x - 100.0x (very rare)
        return (Math.random() * (100.0 - 10.0) + 10.0).toFixed(2);
    }
}

// Generate next coefficient based on last coefficient
function generateNextCoefficient(lastCoef) {
    // Based on last coef, decide probability weights
    let newCoef;

    if (lastCoef >= 10) {
        // After very high coef → most likely low next round
        const r = Math.random() * 100;
        if (r < 75) {
            newCoef = (Math.random() * (2.0 - 1.01) + 1.01).toFixed(2);
        } else if (r < 92) {
            newCoef = (Math.random() * (5.0 - 2.0) + 2.0).toFixed(2);
        } else if (r < 98) {
            newCoef = (Math.random() * (10.0 - 5.0) + 5.0).toFixed(2);
        } else {
            newCoef = (Math.random() * (50.0 - 10.0) + 10.0).toFixed(2);
        }
    } else if (lastCoef >= 5) {
        // After high coef → likely low/medium
        const r = Math.random() * 100;
        if (r < 68) {
            newCoef = (Math.random() * (2.0 - 1.01) + 1.01).toFixed(2);
        } else if (r < 88) {
            newCoef = (Math.random() * (5.0 - 2.0) + 2.0).toFixed(2);
        } else if (r < 97) {
            newCoef = (Math.random() * (10.0 - 5.0) + 5.0).toFixed(2);
        } else {
            newCoef = (Math.random() * (100.0 - 10.0) + 10.0).toFixed(2);
        }
    } else if (lastCoef >= 2) {
        // After medium coef → balanced
        const r = Math.random() * 100;
        if (r < 60) {
            newCoef = (Math.random() * (2.0 - 1.01) + 1.01).toFixed(2);
        } else if (r < 82) {
            newCoef = (Math.random() * (5.0 - 2.0) + 2.0).toFixed(2);
        } else if (r < 93) {
            newCoef = (Math.random() * (10.0 - 5.0) + 5.0).toFixed(2);
        } else {
            newCoef = (Math.random() * (100.0 - 10.0) + 10.0).toFixed(2);
        }
    } else {
        // After low coef (1.01 - 2.0) → slightly higher chance for bigger next
        const r = Math.random() * 100;
        if (r < 50) {
            newCoef = (Math.random() * (2.0 - 1.01) + 1.01).toFixed(2);
        } else if (r < 78) {
            newCoef = (Math.random() * (5.0 - 2.0) + 2.0).toFixed(2);
        } else if (r < 92) {
            newCoef = (Math.random() * (10.0 - 5.0) + 5.0).toFixed(2);
        } else {
            newCoef = (Math.random() * (100.0 - 10.0) + 10.0).toFixed(2);
        }
    }

    return newCoef;
}

// Show YouTube-style win banner
function showWinBanner(coef) {
    const banner = document.getElementById('winBanner');
    const bannerCoef = document.getElementById('winBannerCoef');
    const bannerAmount = document.getElementById('winBannerAmount');

    // Fake win amount based on coef (realistic look)
    const baseAmount = Math.floor(Math.random() * 40000 + 10000);
    const winAmount = Math.floor(baseAmount * coef);
    const formatted = winAmount.toLocaleString('uz-UZ');

    bannerCoef.textContent = `x${coef}`;
    bannerAmount.textContent = `+${formatted} UZS`;

    // Reset animation
    banner.style.display = 'none';
    banner.style.animation = 'none';
    void banner.offsetWidth; // reflow
    banner.style.animation = '';
    banner.style.display = 'block';
}

// Launch animation - wrapper (boy + fire) diagonal uchadi
function triggerLaunchAnimation(callback) {
    const wrapper = document.getElementById('flyWrapper');

    // To'liq reset — avvalgi animatsiyani o'chirib tashlash
    wrapper.classList.remove('launch');
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth; // reflow
    wrapper.style.animation = '';

    wrapper.classList.add('launch');

    // 2.5s da ekrandan chiqadi → natija ko'rsatiladi
    setTimeout(() => {
        if (callback) callback();
    }, 2500);
}

// One prediction per click based on last coef input
document.getElementById('calculateBtn').addEventListener('click', function() {
    const lastCoefInput = parseFloat(document.getElementById('lastCoef').value);
    const container = document.getElementById('predictionsContainer');

    if (!lastCoefInput || lastCoefInput < 1.01) {
        alert('Iltimos, oxirgi koeffitsientni to\'g\'ri kiriting! (masalan: 2.45)');
        return;
    }

    // Disable button during animation
    const btn = document.getElementById('calculateBtn');
    btn.disabled = true;

    // Hide previous results
    container.classList.remove('show');
    document.getElementById('winBanner').style.display = 'none';

    // Generate coefficient
    const newCoef = generateNextCoefficient(lastCoefInput);

    // First: launch animation, then show result
    triggerLaunchAnimation(() => {
        // Clear old result and show only new one
        container.innerHTML = '';
        const item = document.createElement('div');
        item.className = 'prediction-item';
        item.innerHTML = `
            <span class="prediction-round">Keyingi raund:</span>
            <span class="prediction-coefficient">x${newCoef}</span>
        `;
        container.appendChild(item);
        container.classList.add('show');

        // Update main display
        const coefficientsDiv = document.getElementById('coefficients');
        coefficientsDiv.innerText = `x${newCoef}`;
        coefficientsDiv.classList.remove('smallt');
        coefficientsDiv.classList.add('kif');

        const responseText = document.getElementById('responseText');
        responseText.textContent = `${newCoef}x`;
        responseText.className = 'text betting';        // Show win banner
        showWinBanner(newCoef);

        // Re-enable button & reset wrapper immediately so next click works
        btn.disabled = false;
        const wrapper = document.getElementById('flyWrapper');
        wrapper.classList.remove('launch');
        wrapper.style.animation = 'none';
        void wrapper.offsetWidth;
        wrapper.style.animation = '';

        // Clear input
        document.getElementById('lastCoef').value = '';
        document.getElementById('lastCoef').focus();        localStorage.setItem('lastPrediction', newCoef);
    });
});
