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

// Operatörspriser – ordinarie nivåer enligt operatörernas hemsidor
const operators = {
    'Telia': {
        name: 'Telia',
        prices: { '5': 299, '10': 299, '20': 399, '30': 399, '50': 499, '100': 499, 'unlimited': 499 },
        coverage: 98,
        speed: '5G'
    },
    'Telenor': {
        name: 'Telenor',
        prices: { '5': 299, '10': 299, '20': 299, '30': 399, '50': 399, '100': 399, 'unlimited': 449 },
        coverage: 97,
        speed: '5G'
    },
    'Tre': {
        name: 'Tre',
        prices: { '5': 229, '10': 229, '20': 329, '30': 329, '50': 329, '100': 329, 'unlimited': 429 },
        coverage: 95,
        speed: '4G/5G'
    },
    'Tele2': {
        name: 'Tele2',
        prices: { '5': 249, '10': 249, '20': 329, '30': 329, '50': 329, '100': 329, 'unlimited': 479 },
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

// Step 1: Select operator
let selectedOperator = null;
const step1Form = document.getElementById('step1-form');
const step2Form = document.getElementById('step2-form');
const operatorButtons = document.querySelectorAll('.operator-btn');
const step1Btn = document.getElementById('step1-btn');

operatorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        operatorButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedOperator = this.dataset.operator;
        step1Btn.disabled = false;
    });
});

step1Btn.addEventListener('click', () => {
    if (!selectedOperator) return;
    step1Form.classList.add('hidden');
    step2Form.classList.remove('hidden');
    selectedDataAmount = null;
    dataInput.value = '';
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
    step2Btn.disabled = true;
    setTimeout(() => {
        step2Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        dataInput.focus({ preventScroll: true });
    }, 100);
});

// Enter on step 1 (operator selected) goes to step 2
document.getElementById('step1-form')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && selectedOperator && !step1Form.classList.contains('hidden')) {
        e.preventDefault();
        step1Btn.click();
    }
});

// Step 2: Input data amount
let selectedDataAmount = null;
const step2BackBtn = document.getElementById('step2-back');
const step2Btn = document.getElementById('step2-btn');
const dataInput = document.getElementById('data-amount');
const dataUnlimitedBtn = document.getElementById('data-unlimited-btn');
const dataUnknownBtn = document.getElementById('data-unknown-btn');
const dataOptionButtons = document.querySelectorAll('.data-option-btn');

function clearDataSelectionUI() {
    dataOptionButtons.forEach(btn => btn.classList.remove('active'));
}

step2BackBtn.addEventListener('click', () => {
    step2Form.classList.add('hidden');
    step1Form.classList.remove('hidden');
    selectedDataAmount = null;
    dataInput.value = '';
    clearDataSelectionUI();
    if (selectedOperator) {
        const selectedBtn = document.querySelector(`.operator-btn[data-operator="${selectedOperator}"]`);
        if (selectedBtn) selectedBtn.classList.add('active');
    }
});

// Handle data option buttons (Obegränsat, Vet inte)
dataUnlimitedBtn.addEventListener('click', function() {
    clearDataSelectionUI();
    this.classList.add('active');
    selectedDataAmount = 1000;
    dataInput.value = '';
    step2Btn.disabled = false;
});

dataUnknownBtn.addEventListener('click', function() {
    clearDataSelectionUI();
    this.classList.add('active');
    selectedDataAmount = 50;
    dataInput.value = '';
    step2Btn.disabled = false;
});

// Handle manual input
dataInput.addEventListener('input', function() {
    const value = parseInt(this.value, 10);
    if (value && value > 0) {
        clearDataSelectionUI();
        selectedDataAmount = value;
        step2Btn.disabled = false;
    } else if (!this.value) {
        selectedDataAmount = null;
        step2Btn.disabled = true;
    }
});

dataInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && selectedDataAmount) {
        e.preventDefault();
        step2Btn.click();
    }
});

// Enter on step 2 submits
document.getElementById('step2-form')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && selectedDataAmount && !e.target.matches('input[type="number"]')) {
        e.preventDefault();
        step2Btn.click();
    }
});

step2Btn.addEventListener('click', async () => {
    if (!selectedDataAmount) {
        alert('Vänligen välj eller ange din surfmängd');
        return;
    }
    // Loading state
    const btnLabel = step2Btn.querySelector('span');
    const originalHtml = step2Btn.innerHTML;
    step2Btn.disabled = true;
    step2Btn.innerHTML = '<span>Beräknar...</span>';
    await new Promise(r => setTimeout(r, 450));
    showResults(selectedOperator, selectedDataAmount);
    step2Btn.disabled = false;
    step2Btn.innerHTML = originalHtml;
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
    step2Form.classList.add('hidden');
    
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
    
    // Warning block "Du betalar lite för mycket" – tydligare, med formulär Bli uppringd
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
                <div class="warning-callback-form">
                    <h4 class="warning-callback-title">Bli uppringd</h4>
                    <p class="warning-callback-desc">Fyll i så ringer vi upp dig med ett bättre erbjudande.</p>
                    <form id="callback-form" class="callback-form">
                        <div class="callback-field">
                            <label for="callback-fornamn">Förnamn</label>
                            <input type="text" id="callback-fornamn" name="fornamn" placeholder="T.ex. Anna" required autocomplete="given-name">
                        </div>
                        <div class="callback-field">
                            <label for="callback-mobil">Mobilnummer</label>
                            <div class="callback-phone-wrap">
                                <span class="callback-prefix">+46</span>
                                <input type="tel" id="callback-mobil" name="mobil" placeholder="70 123 45 67" required autocomplete="tel" maxlength="12">
                            </div>
                        </div>
                        <button type="submit" class="cta-primary large" id="contact-btn">
                            <span>Bli uppringd</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </form>
                </div>
                <button type="button" class="btn-secondary btn-edit" id="edit-from-results-btn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M11.667 3.333H3.333A1.667 1.667 0 0 0 1.667 5v11.667A1.667 1.667 0 0 0 3.333 18.333h11.667A1.667 1.667 0 0 0 16.667 16.667V8.333L11.667 3.333z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11.667 3.333v5h5M15 18.333H5M8.333 9.167h5M8.333 12.5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Ändra uppgifter</span>
                </button>
            </div>
        </div>
    `;
    resultsContainer.appendChild(warningCard);
    
    document.getElementById('callback-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fornamn = document.getElementById('callback-fornamn').value.trim();
        const mobil = document.getElementById('callback-mobil').value.trim();
        if (!fornamn || !mobil) return;
        alert('Tack ' + fornamn + '! Vi ringer upp dig på ' + mobil + ' snart med ett bättre erbjudande.');
    });
    
    document.getElementById('edit-from-results-btn')?.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        step2Form.classList.remove('hidden');
        step1Form.classList.add('hidden');
        if (dataAmount >= 1000) {
            dataInput.value = '';
            clearDataSelectionUI();
            dataUnlimitedBtn.classList.add('active');
        } else {
            dataInput.value = dataAmount;
            clearDataSelectionUI();
        }
        selectedDataAmount = dataAmount;
        step2Btn.disabled = false;
        step2Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
