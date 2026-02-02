// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Remove old comparison selectors - now using new step-by-step flow

// Complete operator data with standard prices
const operators = {
    'Telia': {
        name: 'Telia',
        prices: { '5': 199, '10': 249, '20': 299, '30': 349, '50': 399, '100': 449, 'unlimited': 499 },
        coverage: 98,
        speed: '5G'
    },
    'Telenor': {
        name: 'Telenor',
        prices: { '5': 179, '10': 229, '20': 279, '30': 329, '50': 379, '100': 429, 'unlimited': 479 },
        coverage: 97,
        speed: '5G'
    },
    'Tre': {
        name: 'Tre',
        prices: { '5': 149, '10': 199, '20': 249, '30': 299, '50': 349, '100': 399, 'unlimited': 449 },
        coverage: 95,
        speed: '4G/5G'
    },
    'Tele2': {
        name: 'Tele2',
        prices: { '5': 169, '10': 219, '20': 269, '30': 319, '50': 369, '100': 419, 'unlimited': 469 },
        coverage: 96,
        speed: '4G/5G'
    },
    'Hallon': {
        name: 'Hallon',
        prices: { '5': 139, '10': 189, '20': 239, '30': 289, '50': 339, '100': 389, 'unlimited': 439 },
        coverage: 95,
        speed: '4G/5G'
    },
    'Vimla': {
        name: 'Vimla',
        prices: { '5': 129, '10': 179, '20': 229, '30': 279, '50': 329, '100': 379, 'unlimited': 429 },
        coverage: 96,
        speed: '4G/5G'
    },
    'Comviq': {
        name: 'Comviq',
        prices: { '5': 159, '10': 209, '20': 259, '30': 309, '50': 359, '100': 409, 'unlimited': 459 },
        coverage: 97,
        speed: '4G/5G'
    },
    'Fello': {
        name: 'Fello',
        prices: { '5': 119, '10': 169, '20': 219, '30': 269, '50': 319, '100': 369, 'unlimited': 419 },
        coverage: 94,
        speed: '4G/5G'
    },
    'Halebop': {
        name: 'Halebop',
        prices: { '5': 149, '10': 199, '20': 249, '30': 299, '50': 349, '100': 399, 'unlimited': 449 },
        coverage: 98,
        speed: '4G/5G'
    }
};

// Calculate price based on data amount
function calculatePrice(operatorName, dataAmount) {
    const operator = operators[operatorName];
    if (!operator) return null;
    
    const prices = operator.prices;
    
    // If unlimited
    if (dataAmount >= 1000) {
        return prices.unlimited;
    }
    
    // Find closest price tier
    const tiers = [5, 10, 20, 30, 50, 100];
    for (let i = tiers.length - 1; i >= 0; i--) {
        if (dataAmount >= tiers[i]) {
            return prices[tiers[i].toString()];
        }
    }
    
    return prices['5']; // Default to 5GB
}

// Get all standard prices for a data amount
function getStandardPrices(dataAmount) {
    const standardPrices = {};
    Object.keys(operators).forEach(opName => {
        standardPrices[opName] = calculatePrice(opName, dataAmount);
    });
    return standardPrices;
}

// Animated number counter
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    };
    window.requestAnimationFrame(step);
}

// Start stat animations when hero is visible
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = document.querySelectorAll('.stat-number[data-target]');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateValue(stat, 0, target, 1500);
            });
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero');
if (heroSection) {
    statObserver.observe(heroSection);
}

// Format phone number for PTS API (10 digits starting with 07)
function formatPhoneForPTS(phoneNumber) {
    // Remove +46, spaces, dashes, and any non-digit characters
    let cleaned = phoneNumber.replace(/[\s\-+]/g, '').replace(/\D/g, '');
    
    // Remove leading 46 (country code) if present
    if (cleaned.startsWith('46')) {
        cleaned = cleaned.substring(2);
    }
    
    // Ensure it starts with 07
    if (!cleaned.startsWith('07')) {
        // If it starts with 7, add leading 0
        if (cleaned.startsWith('7')) {
            cleaned = '0' + cleaned;
        } else {
            // If it doesn't start with 7, try to find 07 in the number
            const sevenIndex = cleaned.indexOf('7');
            if (sevenIndex > 0) {
                cleaned = cleaned.substring(sevenIndex - 1);
            } else {
                // If no 7 found, prepend 07
                cleaned = '07' + cleaned;
            }
        }
    }
    
    // Ensure it's exactly 10 digits starting with 07
    if (cleaned.startsWith('07') && cleaned.length > 10) {
        // Take first 10 digits
        cleaned = cleaned.substring(0, 10);
    } else if (cleaned.startsWith('07') && cleaned.length < 10) {
        // Pad with zeros if needed (shouldn't happen, but just in case)
        cleaned = cleaned.padEnd(10, '0');
    }
    
    // Final validation: must be 10 digits starting with 07
    if (cleaned.startsWith('07') && cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
        return cleaned;
    }
    
    return null;
}

// Detect operator from phone number using PTS API
async function detectOperator(phoneNumber) {
    try {
        const formattedNumber = formatPhoneForPTS(phoneNumber);
        
        if (!formattedNumber || formattedNumber.length !== 10 || !formattedNumber.startsWith('07')) {
            return null;
        }
        
        // PTS API endpoint
        // Note: PTS API has CORS restrictions, so we need to use a CORS proxy
        // or implement a backend proxy endpoint
        const apiUrl = `https://nummer.pts.se/NbrSearch?number=${formattedNumber}`;
        
        // Try using a CORS proxy service or direct fetch
        // Using allorigins.win as a CORS proxy (you may want to set up your own)
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
        
        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // allorigins returns the content in a 'contents' field
                if (data.contents) {
                    const html = data.contents;
                    // Parse HTML response to extract operator name
                    const operator = parsePTSResponse(html);
                    if (operator) {
                        return mapPTSToOperator(operator);
                    }
                }
            }
        } catch (proxyError) {
            console.log('Proxy error, trying direct fetch:', proxyError);
            
            // Try direct fetch (will likely fail due to CORS, but worth trying)
            try {
                const directResponse = await fetch(apiUrl, {
                    method: 'GET',
                    mode: 'no-cors', // This won't give us the response, but we try
                });
            } catch (directError) {
                console.log('Direct fetch also failed:', directError);
            }
        }
        
        // IMPORTANT: If PTS API fails, we should NOT use fallback
        // because prefix-based detection is inaccurate due to number portability
        // Instead, return null and let user know they need to select manually
        console.warn('PTS API unavailable, cannot accurately detect operator');
        return null;
        
    } catch (error) {
        console.error('Error detecting operator:', error);
        // Don't use fallback - prefix detection is unreliable
        return null;
    }
}

// Parse PTS HTML response to extract operator name
function parsePTSResponse(html) {
    // PTS returns HTML, we need to parse it
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for operator name in various possible locations
    // PTS typically shows operator in a table or specific div
    const operatorSelectors = [
        '[data-operator]',
        '.operator',
        '.operator-name',
        'td.operator',
        'th.operator',
        '[class*="operator"]',
        '[id*="operator"]'
    ];
    
    for (const selector of operatorSelectors) {
        const elements = doc.querySelectorAll(selector);
        for (const element of elements) {
            const text = element.textContent.trim();
            if (text && text.length > 0 && text.length < 50) {
                // Check if it contains an operator name
                const operators = ['Telia', 'Telenor', 'Tele2', 'Tre', 'Hallon', 'Vimla', 'Comviq', 'Fello', 'Halebop'];
                for (const op of operators) {
                    if (text.includes(op)) {
                        return op;
                    }
                }
            }
        }
    }
    
    // Try to find in all table cells and divs
    const allElements = doc.querySelectorAll('td, th, div, span, p');
    for (const element of allElements) {
        const text = element.textContent.trim();
        // Look for operator names in the text
        const operators = ['Telia', 'Telenor', 'Tele2', 'Tre', 'Hallon', 'Vimla', 'Comviq', 'Fello', 'Halebop'];
        for (const op of operators) {
            // Check if text contains operator name (but not as part of a longer word)
            const regex = new RegExp(`\\b${op}\\b`, 'i');
            if (regex.test(text) && text.length < 100) {
                return op;
            }
        }
    }
    
    // Last resort: search in raw HTML
    const operators = ['Telia', 'Telenor', 'Tele2', 'Tre', 'Hallon', 'Vimla', 'Comviq', 'Fello', 'Halebop'];
    for (const op of operators) {
        const regex = new RegExp(`\\b${op}\\b`, 'i');
        if (regex.test(html)) {
            // Try to extract context around the operator name
            const match = html.match(new RegExp(`([^<>]*${op}[^<>]*)`, 'i'));
            if (match && match[1]) {
                const context = match[1].trim();
                if (context.length < 100) {
                    return op;
                }
            }
        }
    }
    
    return null;
}

// Map PTS operator names to our operator names
function mapPTSToOperator(ptsOperator) {
    const operatorMap = {
        'Telia': 'Telia',
        'Telenor': 'Telenor',
        'Tele2': 'Tele2',
        'Tre': 'Tre',
        '3': 'Tre',
        'Hallon': 'Hallon',
        'Vimla': 'Vimla',
        'Comviq': 'Comviq',
        'Fello': 'Fello',
        'Halebop': 'Halebop',
        'Halebop (Telia)': 'Halebop',
        'Vimla (Telenor)': 'Vimla',
        'Hallon (Tre)': 'Hallon',
        'Fello (Tele2)': 'Fello'
    };
    
    // Try exact match first
    if (operatorMap[ptsOperator]) {
        return operatorMap[ptsOperator];
    }
    
    // Try case-insensitive match
    const lowerOperator = ptsOperator.toLowerCase();
    for (const [key, value] of Object.entries(operatorMap)) {
        if (key.toLowerCase() === lowerOperator) {
            return value;
        }
    }
    
    return null;
}

// Fallback: Detect operator by prefix (if PTS API fails)
// NOTE: This is a fallback only - PTS API should be used for accurate results
// Prefix mapping may not be 100% accurate as number portability exists
function detectOperatorByPrefix(phoneNumber) {
    // Ensure we have a properly formatted number
    const formatted = formatPhoneForPTS(phoneNumber);
    if (!formatted) {
        return null;
    }
    
    // Swedish mobile number prefixes (first 3 digits of 07X)
    // Note: Due to number portability, prefix-based detection is not always accurate
    const prefixMap = {
        '070': 'Telia',
        '071': 'Telenor',
        '072': 'Telenor',
        '073': 'Tele2',
        '074': 'Telenor',
        '075': 'Telia',
        '076': 'Tele2', // Updated: 076 is Tele2, not Telenor
        '079': 'Telenor'
    };
    
    // Check 3-digit prefix (07X)
    if (formatted.length >= 3) {
        const prefix = formatted.substring(0, 3);
        if (prefixMap[prefix]) {
            return prefixMap[prefix];
        }
    }
    
    return null;
}

// Step 1: Select operator
let selectedOperator = null;
const step1Form = document.getElementById('step1-form');
const step2Form = document.getElementById('step2-form');
const phoneForm = document.getElementById('phone-form');
const operatorButtons = document.querySelectorAll('.operator-btn');
const step1Btn = document.getElementById('step1-btn');

operatorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        operatorButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedOperator = this.dataset.operator;
        step1Btn.disabled = false;
        // Hide detected operator badge if manually selected
        document.getElementById('detected-operator').style.display = 'none';
    });
});


// Phone number detection (inline in step 1)
const phoneInputInline = document.getElementById('phone-number-inline');
const phoneDetectInlineBtn = document.getElementById('phone-detect-inline-btn');

phoneDetectInlineBtn.addEventListener('click', async () => {
    const phoneNumber = phoneInputInline.value.trim();
    if (!phoneNumber) {
        alert('Vänligen ange ditt telefonnummer');
        return;
    }
    
    // Show loading state
    phoneDetectInlineBtn.disabled = true;
    phoneDetectInlineBtn.innerHTML = '<span>Söker...</span>';
    
    try {
        const detected = await detectOperator(phoneNumber);
        
        if (detected) {
            selectedOperator = detected;
            // Show detected operator and select it
            document.getElementById('detected-operator-name').textContent = detected;
            document.getElementById('detected-operator').style.display = 'block';
            
            // Auto-select the operator button
            const operatorBtn = document.querySelector(`.operator-btn[data-operator="${detected}"]`);
            if (operatorBtn) {
                operatorButtons.forEach(b => b.classList.remove('active'));
                operatorBtn.classList.add('active');
                step1Btn.disabled = false;
            }
            
            // Clear phone input
            phoneInputInline.value = '';
        } else {
            alert('Kunde inte identifiera operatör från numret via PTS. Vänligen välj din operatör manuellt ovan. (PTS API kräver en backend-proxy för att fungera korrekt)');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ett fel uppstod vid sökning. Välj manuellt ovan.');
    } finally {
        // Reset button state
        phoneDetectInlineBtn.disabled = false;
        phoneDetectInlineBtn.innerHTML = `
            <span>Hitta min operatör</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
});

phoneInputInline.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        await phoneDetectInlineBtn.click();
    }
});

// Phone number detection (separate form)
const phoneInput = document.getElementById('phone-number');
const phoneDetectBtn = document.getElementById('phone-detect-btn');
const phoneBackBtn = document.getElementById('phone-back-btn');

phoneDetectBtn.addEventListener('click', async () => {
    const phoneNumber = phoneInput.value.trim();
    if (!phoneNumber) {
        alert('Vänligen ange ditt telefonnummer');
        return;
    }
    
    // Show loading state
    phoneDetectBtn.disabled = true;
    phoneDetectBtn.innerHTML = '<span>Söker...</span>';
    
    try {
        const detected = await detectOperator(phoneNumber);
        
        if (detected) {
            selectedOperator = detected;
            // Show detected operator and go back to step 1
            document.getElementById('detected-operator-name').textContent = detected;
            document.getElementById('detected-operator').style.display = 'block';
            
            // Auto-select the operator button
            const operatorBtn = document.querySelector(`.operator-btn[data-operator="${detected}"]`);
            if (operatorBtn) {
                operatorButtons.forEach(b => b.classList.remove('active'));
                operatorBtn.classList.add('active');
                step1Btn.disabled = false;
            }
            
            phoneForm.classList.add('hidden');
            step1Form.classList.remove('hidden');
        } else {
            alert('Kunde inte identifiera operatör från numret. Välj manuellt nedan.');
            phoneForm.classList.add('hidden');
            step1Form.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ett fel uppstod vid sökning. Välj manuellt nedan.');
        phoneForm.classList.add('hidden');
        step1Form.classList.remove('hidden');
    } finally {
        // Reset button state
        phoneDetectBtn.disabled = false;
        phoneDetectBtn.innerHTML = `
            <span>Hitta min operatör</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
});

phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        phoneDetectBtn.click();
    }
});

phoneBackBtn.addEventListener('click', () => {
    phoneForm.classList.add('hidden');
    step1Form.classList.remove('hidden');
});

step1Btn.addEventListener('click', () => {
    if (!selectedOperator) return;
    step1Form.classList.add('hidden');
    step2Form.classList.remove('hidden');
    // Reset data selection
    selectedDataAmount = null;
    dataInput.value = '';
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
    step2Btn.disabled = true;
});

// Step 2: Input data amount
// Step 2: Input data amount
let selectedDataAmount = null;
const step2BackBtn = document.getElementById('step2-back');
const step2Btn = document.getElementById('step2-btn');
const dataInput = document.getElementById('data-amount');
const dataUnlimitedBtn = document.getElementById('data-unlimited-btn');
const dataUnknownBtn = document.getElementById('data-unknown-btn');
const dataOptionButtons = document.querySelectorAll('.data-option-btn');

step2BackBtn.addEventListener('click', () => {
    step2Form.classList.add('hidden');
    step1Form.classList.remove('hidden');
    // Reset selections
    selectedDataAmount = null;
    dataInput.value = '';
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
    // Keep operator selected
    if (selectedOperator) {
        const selectedBtn = document.querySelector(`.operator-btn[data-operator="${selectedOperator}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
});

// Handle data option buttons
dataUnlimitedBtn.addEventListener('click', function() {
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    selectedDataAmount = 1000; // Use 1000 for unlimited
    dataInput.value = '';
    step2Btn.disabled = false;
});

dataUnknownBtn.addEventListener('click', function() {
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    selectedDataAmount = 50; // Use average/default (50 GB)
    dataInput.value = '';
    step2Btn.disabled = false;
});

// Handle manual input
dataInput.addEventListener('input', function() {
    const value = parseInt(this.value);
    if (value && value > 0) {
        dataOptionButtons.forEach(btn => btn.classList.remove('active'));
        selectedDataAmount = value;
        step2Btn.disabled = false;
    } else if (!this.value) {
        selectedDataAmount = null;
        step2Btn.disabled = true;
    }
});

dataInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && selectedDataAmount) {
        step2Btn.click();
    }
});

step2Btn.addEventListener('click', () => {
    if (!selectedDataAmount) {
        alert('Vänligen välj eller ange din surfmängd');
        return;
    }
    
    showResults(selectedOperator, selectedDataAmount);
});

// Show results
function showResults(operatorName, dataAmount) {
    const resultsContainer = document.getElementById('results-container');
    const currentPrice = calculatePrice(operatorName, dataAmount);
    const standardPrices = getStandardPrices(dataAmount);
    
    // Find best price
    const allPrices = Object.values(standardPrices);
    const bestPrice = Math.min(...allPrices);
    const potentialSavings = currentPrice - bestPrice;
    
    // Sort operators by price
    const sortedOperators = Object.keys(standardPrices)
        .map(name => ({
            name,
            price: standardPrices[name],
            operator: operators[name]
        }))
        .sort((a, b) => a.price - b.price);
    
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('hidden');
    
    // Current price display - Improved design
    const currentPriceCard = document.createElement('div');
    currentPriceCard.className = 'current-price-card';
    currentPriceCard.innerHTML = `
        <div class="current-price-header">
            <div class="current-operator-badge">${operatorName}</div>
            <div class="current-data">${dataAmount >= 1000 ? 'Obegränsat' : dataAmount + ' GB'}</div>
        </div>
        <div class="current-price-amount">
            <span class="price-label">Du betalar troligen</span>
            <span class="price-value">${currentPrice} kr/mån</span>
        </div>
        <div class="price-breakdown">
            <div class="breakdown-item">
                <span class="breakdown-label">Operatör</span>
                <span class="breakdown-value">${operatorName}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Data</span>
                <span class="breakdown-value">${dataAmount >= 1000 ? 'Obegränsat' : dataAmount + ' GB'}</span>
            </div>
            <div class="breakdown-item">
                <span class="breakdown-label">Månadskostnad</span>
                <span class="breakdown-value highlight">${currentPrice} kr</span>
            </div>
        </div>
    `;
    resultsContainer.appendChild(currentPriceCard);
    
    // Warning message with call-to-action - Improved design
    const warningCard = document.createElement('div');
    warningCard.className = 'warning-card';
    warningCard.innerHTML = `
        <div class="warning-content-wrapper">
            <div class="warning-icon-wrapper">
                <div class="warning-icon">⚠️</div>
            </div>
            <div class="warning-content">
                <h3 class="warning-title">Du betalar lite för mycket</h3>
                <p class="warning-text">Vi ringer upp dig med ett bättre abonnemang som passar dina behov och din plånbok. Kostnadsfritt – du bestämmer om du vill byta.</p>
                <div class="warning-benefits">
                    <div class="benefit-item">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Gratis konsultation</span>
                    </div>
                    <div class="benefit-item">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Spara pengar varje månad</span>
                    </div>
                    <div class="benefit-item">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>Ingen bindningstid</span>
                    </div>
                </div>
                <button class="cta-primary large" id="contact-btn">
                    <span>Bli uppringd för ett bättre erbjudande</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    resultsContainer.appendChild(warningCard);
    
    document.getElementById('contact-btn')?.addEventListener('click', () => {
        alert('Tack! Vi ringer upp dig snart med ett bättre erbjudande.');
    });
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// CTA buttons scroll to comparison
document.getElementById('start-check-btn')?.addEventListener('click', () => {
    document.getElementById('compare').scrollIntoView({ behavior: 'smooth' });
});


// Nav CTA button
document.querySelector('.nav-cta')?.addEventListener('click', () => {
    document.getElementById('compare').scrollIntoView({ behavior: 'smooth' });
});

// Premium Intersection Observer for smooth section transitions
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

// Observe all sections
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    sectionObserver.observe(section);
});

// Card observer for staggered animations
const cardObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 150);
            cardObserver.unobserve(entry.target);
        }
    });
}, cardObserverOptions);

// Observe step cards and feature cards
document.querySelectorAll('.step-card, .feature-card').forEach(card => {
    cardObserver.observe(card);
});

// Parallax effect for hero section (subtle)
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Premium loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.style.opacity = '1';
        
        // Show hero section immediately
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.classList.add('visible');
        }
    }, 100);
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Keyboard navigation for form options
document.querySelectorAll('.data-option, .priority-option').forEach(option => {
    option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            option.click();
        }
    });
    
    // Make options focusable
    option.setAttribute('tabindex', '0');
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// Add ripple to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add ripple CSS dynamically
const style = document.createElement('style');
style.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
