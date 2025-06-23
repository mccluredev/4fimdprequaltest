document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sections = document.querySelectorAll('.section');
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    let currentSection = 0;
    let isAnimating = false;

    // Initialize form functionality based on current page
    const form = document.getElementById('loan-widget-form');
    const prequalForm = document.getElementById('prequalForm');

    // Hide loading screen immediately on page load
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }

    // Index page functionality
    if (form) {
        const amountInput = document.getElementById('loan-amount');
        const errorMessage = document.getElementById('amount-error');

        function formatCurrency(value) {
            return value.replace(/[^0-9]/g, '');
        }

        function validateAmount(amount) {
            const value = parseInt(formatCurrency(amount));
            return value >= 1000 && value <= 1000000;
        }

        amountInput.addEventListener('input', function(e) {
            let value = formatCurrency(e.target.value);
            if (value) {
                value = parseInt(value).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
                e.target.value = value;
            }
        });

        form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    }).then(() => {
        window.location.href = `payment-calculator.html?amount=${loanAmount}`;
    }).catch(() => {
        alert("There was an error submitting your application. Please try again.");
    });
});


    // Prequalification page functionality
    if (prequalForm) {
        // Check for loan amount in URL and redirect if not present
        const urlParams = new URLSearchParams(window.location.search);
        const loanAmount = urlParams.get('amount');

        if (!loanAmount) {
            window.location.href = './index.html';
            return;
        }

        // Format and set the loan amount
        const formattedAmount = parseInt(loanAmount.replace(/[^0-9]/g, '')).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        document.getElementById('00NHs00000lzslH').value = formattedAmount;

        // Initialize Google Places Autocomplete
        const autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('autocomplete'),
            {types: ['address'], componentRestrictions: {country: 'US'}}
        );

        // Handle address selection
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zipCode = '';

            // Parse address components
            for (const component of place.address_components) {
                const type = component.types[0];
                switch (type) {
                    case 'street_number':
                        streetNumber = component.long_name;
                        break;
                    case 'route':
                        route = component.long_name;
                        break;
                    case 'locality':
                        city = component.long_name;
                        break;
                    case 'administrative_area_level_1':
                        state = component.short_name;
                        break;
                    case 'postal_code':
                        zipCode = component.long_name;
                        break;
                }
            }

            // Set hidden field values
            document.getElementById('street').value = `${streetNumber} ${route}`.trim();
            document.getElementById('city').value = city;
            document.getElementById('state').value = state;
            document.getElementById('zip').value = zipCode;
        });

        // Handle loan purpose selection
        const loanPurpose = document.getElementById('00NHs00000scaqg');
        const otherPurpose = document.getElementById('other-purpose');
        const otherPurposeText = document.getElementById('00NQP000003JB1F');

        loanPurpose.addEventListener('change', function() {
            const isOther = this.value === 'Other';
            otherPurpose.classList.toggle('hidden', !isOther);

            if (isOther) {
                otherPurposeText.setAttribute('required', 'required');
            } else {
                otherPurposeText.removeAttribute('required');
                otherPurposeText.value = '';
            }
        });

        // Handle business established selection
        const businessEstablished = document.getElementById('00NHs00000lzslM');
        const yearsContainer = document.getElementById('years-container');
        const yearsInput = document.getElementById('00NHs00000m08cv');

        businessEstablished.addEventListener('change', function() {
            const isEstablished = this.value === 'Yes';
            yearsContainer.classList.toggle('hidden', !isEstablished);

            if (isEstablished) {
                yearsInput.setAttribute('required', 'required');
            } else {
                yearsInput.removeAttribute('required');
                yearsInput.value = '';
            }
        });

        // Format currency inputs
        const currencyInputs = document.querySelectorAll('.currency:not([readonly])');
        currencyInputs.forEach(input => {
            input.addEventListener('blur', formatCurrency);
            input.addEventListener('focus', unformatCurrency);
        });

        function formatCurrency(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                });
                e.target.value = value;
            }
        }

        function unformatCurrency(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }

        // Format phone number
        const phoneInput = document.getElementById('mobile');
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 10) {
                if (value.length > 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
                } else if (value.length > 3) {
                    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                } else if (value.length > 0) {
                    value = `(${value}`;
                }
            }
            e.target.value = value;
        });

        // Calculate interest rate based on FICO score and loan amount
        function calculateInterestRate(creditScore, loanAmount) {
            const amount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
            const score = parseInt(creditScore);

            if (score >= 760) {
                if (amount < 10000) return 14.99;
                if (amount <= 75000) return 13.99;
                if (amount <= 150000) return 12.99;
                return 12.99;
            } else if (score >= 720) {
                if (amount < 10000) return 15.99;
                if (amount <= 75000) return 14.99;
                if (amount <= 150000) return 13.99;
                return 13.99;
            } else if (score >= 680) {
                if (amount < 10000) return 16.99;
                if (amount <= 75000) return 15.99;
                if (amount <= 150000) return 14.99;
                return 14.99;
            } else if (score >= 640) {
                if (amount < 10000) return 17.99;
                if (amount <= 75000) return 16.99;
                return null; // Not eligible for higher amounts
            }
            return null; // Not eligible
        }

        // Calculate monthly payment
        function calculateMonthlyPayment(principal, annualRate, termMonths) {
            const monthlyRate = annualRate / 100 / 12;
            const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
                           (Math.pow(1 + monthlyRate, termMonths) - 1);
            return Math.round(payment * 100) / 100;
        }

        // Update payment calculator
        function updatePaymentCalculator() {
            const loanAmount = document.getElementById('00NHs00000lzslH').value;
            const creditScore = document.getElementById('00NHs00000m08cg').value;
            const termSlider = document.getElementById('term-slider');
            const monthlyPaymentDisplay = document.getElementById('monthly-payment');
            const rateText = document.getElementById('rate-text');
            const currentTerm = document.getElementById('current-term');

            const amount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
            const rate = calculateInterestRate(creditScore, loanAmount);

            if (rate === null) {
                rateText.textContent = "Based on the provided information, please contact us for rate details.";
                monthlyPaymentDisplay.textContent = "Contact us for details";
                return;
            }

            rateText.textContent = `Your estimated interest rate is ${rate}% APR`;
            const payment = calculateMonthlyPayment(amount, rate, parseInt(termSlider.value));
            monthlyPaymentDisplay.textContent = payment.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
            currentTerm.textContent = `${termSlider.value} months`;
        }

        // Form validation
        function validateSection(sectionIndex) {
            const section = sections[sectionIndex];
            const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    isValid = isValid && emailRegex.test(input.value);
                } else if (input.type === 'tel') {
                    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                    isValid = isValid && phoneRegex.test(input.value);
                } else if (input.classList.contains('currency')) {
                    const value = parseInt(input.value.replace(/[^0-9]/g, ''));
                    isValid = isValid && !isNaN(value) && value > 0;
                } else {
                    isValid = isValid && input.value.trim() !== '';
                }

                if (!isValid) {
                    input.classList.add('error-input');
                } else {
                    input.classList.remove('error-input');
                }
            });

            // Special validation for loan purpose
            if (sectionIndex === 0 && loanPurpose.value === 'Other') {
                isValid = isValid && otherPurposeText.value.trim() !== '';
                if (!otherPurposeText.value.trim()) {
                    otherPurposeText.classList.add('error-input');
                }
            }

            return isValid;
        }

        // Navigation event listeners with slide animations
        document.querySelectorAll('.next-button').forEach(button => {
            button.addEventListener('click', async () => {
                if (isAnimating || !validateSection(currentSection)) return;

                isAnimating = true;
                const currentSect = sections[currentSection];
                const nextSection = sections[currentSection + 1];

                // Show loading screen only when going to calculator section
                if (currentSection === 3) {
                    loadingScreen.classList.remove('hidden');
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        updatePaymentCalculator();
                    } finally {
                        loadingScreen.classList.add('hidden');
                    }
                }

                // Prepare next section
                nextSection.classList.remove('hidden');
                nextSection.classList.add('slide-enter');

                // Force reflow
                void nextSection.offsetWidth;

                // Start animation
                currentSect.classList.add('slide-exit-active');
                nextSection.classList.add('slide-enter-active');

                // Wait for animation
                await new Promise(resolve => setTimeout(resolve, 500));

                // Cleanup
                currentSect.classList.add('hidden');
                currentSect.classList.remove('slide-exit-active');
                nextSection.classList.remove('slide-enter', 'slide-enter-active');

                // Update state
                currentSection++;
                updateProgress();
                isAnimating = false;
            });
        });

        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', async () => {
                if (isAnimating) return;
                isAnimating = true;

                const currentSect = sections[currentSection];
                const prevSection = sections[currentSection - 1];

                // Prepare previous section
                prevSection.classList.remove('hidden');
                prevSection.classList.add('slide-back-enter');

                // Force reflow
                void prevSection.offsetWidth;

                // Start animation
                currentSect.classList.add('slide-back-exit-active');
                prevSection.classList.add('slide-back-enter-active');

                // Wait for animation
                await new Promise(resolve => setTimeout(resolve, 500));

                // Cleanup
                currentSect.classList.add('hidden');
                currentSect.classList.remove('slide-back-exit-active');
                prevSection.classList.remove('slide-back-enter', 'slide-back-enter-active');

                // Update state
                currentSection--;
                updateProgress();
                isAnimating = false;
            });
        });

        // Term slider event listener
        const termSlider = document.getElementById('term-slider');
        termSlider.addEventListener('input', updatePaymentCalculator);

        function updateProgress() {
            const progress = ((currentSection + 1) / sections.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Step ${currentSection + 1} of ${sections.length}`;
        }

        // Initialize Cloudflare Turnstile
        window.onloadTurnstileCallback = function() {
            turnstile.render('#turnstile-container', {
                sitekey: '0x4AAAAAAA6JamddI1LF9dFU',
                callback: function(token) {
                    document.getElementById('turnstile-token').value = token;
                },
            });
        };

        // Show first section
        if (sections.length > 0) {
            sections[0].classList.remove('hidden');
        }
        updateProgress();
    }
});
