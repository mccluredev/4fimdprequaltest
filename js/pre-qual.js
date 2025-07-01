document.addEventListener('DOMContentLoaded', function() {
    console.log("Script loaded and running!");

    // Global variable declarations
    let currentSectionIndex = 0;
    let isAnimating = false;
    let streetNumber = "";
    
    // Get DOM elements
    const sections = document.querySelectorAll('.section');
    console.log("Sections found:", sections.length);
    
    const progressBar = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');
    const form = document.getElementById("prequalForm");
    const paymentCalculator = document.getElementById('payment-calculator');
    const loadingScreen = document.getElementById('loading-screen');

    // Prevent step progression if required fields are not filled
   document.querySelectorAll("button.next").forEach(button => {
  button.addEventListener("click", function (e) {
    const form = document.getElementById("prequalForm"); // or use this.closest('form')
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      console.log("❌ Validation failed. Check required fields.");
      return; // Stop here!
    }

    // ✅ Only run step advancement if form is valid
    console.log("✅ All fields valid. Moving to next step...");
    goToNextSection(); // <-- whatever you're using to move forward
  });
});

    
    // Check if sections exist
    if (sections.length === 0) {
        console.error("❌ No sections found. Check if .section elements exist in the HTML.");
        return;
    }
    
    // Check if form exists
    if (!form) {
        console.error("❌ Error: Form not found!");
        return;
    }
    
    // Hide loading screen if it exists
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // SIMPLIFIED NAVIGATION FUNCTIONS
    // Show a specific section and update progress
    function showSection(index) {
        if (index < 0 || index >= sections.length) {
            console.error("Invalid section index:", index);
            return;
        }
        
        // Hide all sections
        sections.forEach(section => section.classList.add('hidden'));
        
        // Show the target section
        sections[index].classList.remove('hidden');
        
        // Update our tracking variable
        currentSectionIndex = index;
        
        // Update progress
        updateProgressBar(index);
        
        console.log(`Navigated to section ${index + 1} of ${sections.length}`);
    }
    
    // Simplified progress bar update
    function updateProgressBar(index) {
        const totalSections = sections.length;
        const progress = ((index + 1) / totalSections) * 100;
        
        console.log(`Updating progress bar: ${progress}% (Section ${index + 1} of ${totalSections})`);
        
        // Set progress bar width directly with inline style
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        // Update progress text
        if (progressText) {
            progressText.textContent = `Step ${index + 1} of ${totalSections}`;
        }
    }
    
    // Initialize with first section
    showSection(0);
    
    // NEW FUNCTION: Calculate the valid term range based on loan amount
    function calculateTermRange(loanAmount) {
        // Default values
        let minTerm = 6;
        let maxTerm = 144;
        
        // Apply business rules based on loan amount
        if (loanAmount <= 10000) {
            minTerm = 6;
            maxTerm = 48; // Up to 4 years
        } else if (loanAmount <= 75000) {
            minTerm = 36; // 3 years
            maxTerm = 120; // 10 years
        } else if (loanAmount <= 150000) {
            minTerm = 60; // 5 years
            maxTerm = 144; // 12 years
        } else {
            minTerm = 84; // 7 years
            maxTerm = 144; // 12 years
        }
        
        return { minTerm, maxTerm };
    }
    
    // Check for loan amount in URL and populate field
    const urlParams = new URLSearchParams(window.location.search);
    const loanAmount = urlParams.get('amount');
    let numericLoanAmount = 0;
    
    if (loanAmount && !isNaN(parseInt(loanAmount))) {
        const loanInput = document.getElementById('00NHs00000lzslH');
        
        if (loanInput) {
            // Format with proper currency symbol
            numericLoanAmount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
            const formattedAmount = numericLoanAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            if (!loanInput.value) {
                loanInput.value = formattedAmount;
            }
            
            // Ensure the dollar sign is visible - sometimes browser or CSS can hide it
            if (!loanInput.value.includes('$')) {
                loanInput.value = '$' + loanInput.value.replace(/^\$/, '');
            }
            
            console.log("Loan amount set to:", formattedAmount);
            
            // Update term slider range based on loan amount
            const termSlider = document.getElementById('term-slider');
            if (termSlider) {
                const { minTerm, maxTerm } = calculateTermRange(numericLoanAmount);
                termSlider.min = minTerm;
                termSlider.max = maxTerm;
                
                // Set initial value to minimum term if current value is out of bounds
                const currentValue = parseInt(termSlider.value);
                if (currentValue < minTerm || currentValue > maxTerm) {
                    termSlider.value = minTerm;
                }
                
                // Update term labels
                const termLabels = document.querySelector('.term-labels');
                if (termLabels) {
                    const spans = termLabels.querySelectorAll('span');
                    if (spans.length >= 3) {
                        spans[0].textContent = `${minTerm} months`;
                        spans[2].textContent = `${maxTerm} months`;
                        spans[1].textContent = `${termSlider.value} months`;
                    }
                }
                
                console.log(`Term slider updated: min=${minTerm}, max=${maxTerm}`);
            }
        } else {
            console.error("Loan amount input field not found!");
        }
    } else {
        console.log("No valid loan amount found in URL.");
    }
    
    // Initialize autocomplete
    const addressInput = document.querySelector("#autocomplete");
    console.log("Address input found:", addressInput ? "Yes" : "No");
    
    // Handle Google Maps initialization
    function initializeGooglePlaces() {
        // Try to find the input again in case it wasn't available earlier
        const addressInput = document.getElementById("autocomplete");
        
        if (!addressInput) {
            console.error("❌ Error: Address input field not found. Make sure element with ID 'autocomplete' exists.");
            return;
        }
        
        try {
            // Use specific options for the autocomplete
            const options = {
                types: ['address'],
                componentRestrictions: { country: 'us' }
            };
            
            const autocomplete = new google.maps.places.Autocomplete(addressInput, options);
            console.log("✅ Autocomplete initialized:", autocomplete);
            
            if (autocomplete && typeof google.maps.event.addListener === "function") {
                google.maps.event.addListener(autocomplete, "place_changed", function() {
                    console.log("📍 Autocomplete place changed event triggered.");
                    const place = autocomplete.getPlace();
                    console.log("📍 Selected place:", place);
                    
                    let streetNumber = "",
                        route = "",
                        city = "",
                        state = "",
                        zipCode = "";
                    
                    if (place.address_components) {
                        for (const component of place.address_components) {
                            const type = component.types[0];
                            switch (type) {
                                case "street_number":
                                    streetNumber = component.long_name;
                                    break;
                                case "route":
                                    route = component.long_name;
                                    break;
                                case "locality":
                                    city = component.long_name;
                                    break;
                                case "administrative_area_level_1":
                                    state = component.short_name;
                                    break;
                                case "postal_code":
                                    zipCode = component.long_name;
                                    break;
                            }
                        }
                    }
                    
                    document.getElementById("street").value = `${streetNumber} ${route}`.trim();
                    document.getElementById("city").value = city;
                    document.getElementById("state").value = state;
                    document.getElementById("zip").value = zipCode;
                });
            } else {
                console.error("❌ Error: Autocomplete is not valid or addListener is missing.");
            }
        } catch (error) {
            console.error("❌ Error initializing autocomplete:", error);
        }
    }
    
    // Wait for Google Maps API to load
    window.onload = function() {
        if (typeof google !== "undefined" && google.maps && google.maps.places) {
            console.log("✅ Google Maps API is loaded correctly.");
            initializeGooglePlaces();
        } else {
            console.error("❌ Error: Google Maps API is not loaded.");
        }
    };
    
    // Handle loan purpose selection
    const loanPurpose = document.getElementById('00NHs00000scaqg');
    const otherPurpose = document.getElementById('other-purpose');
    const otherPurposeText = document.getElementById('00NQP000003JB1F');
    
    if (loanPurpose) {
        // First event listener for showing/hiding other purpose input
        loanPurpose.addEventListener('change', function() {
            const isOther = this.value === 'Other';
            otherPurpose.classList.toggle('hidden', !isOther);
            otherPurposeText.required = isOther;
            if (!isOther) {
                otherPurposeText.value = '';
            }
        });
    }
    
    // Handle business established selection
    const businessEstablished = document.getElementById('00NHs00000lzslM');
    const yearsContainer = document.getElementById('years-container');
    const yearsInput = document.getElementById('00NHs00000m08cv');
    
    if (businessEstablished) {
        businessEstablished.addEventListener('change', function() {
            const isEstablished = this.value === 'Yes';
            yearsContainer.classList.toggle('hidden', !isEstablished);
            yearsInput.required = isEstablished;
            if (!isEstablished) {
                yearsInput.value = '';
            }
        });
    }
    
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
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 10);
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `(${value}`;
                } else if (value.length <= 6) {
                    value = `(${value.slice(0,3)}) ${value.slice(3)}`;
                } else {
                    value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
                }
            }
            e.target.value = value;
        });
        
        // Prevent paste of invalid format
        phoneInput.addEventListener('paste', function(e) {
            e.preventDefault();
            let pastedText = (e.clipboardData || window.clipboardData).getData('text');
            pastedText = pastedText.replace(/\D/g, '').substring(0, 10);
            if (pastedText.length === 10) {
                this.value = `(${pastedText.slice(0,3)}) ${pastedText.slice(3,6)}-${pastedText.slice(6)}`;
            }
        });
    }
    
    // Form validation
    window.validateSection = function(section) {
        console.log("Validating section:", section);
        
        if (!section) {
            console.error("Error: Section is undefined or null.");
            return false;
        }
        
        const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
        console.log("Inputs found for validation:", inputs);
        
        let isValid = true;
        
        inputs.forEach(input => {
            console.log(`Validating input: ${input.name || input.id}, Value: ${input.value}`);
            
            if (input.type === 'email') {
                const emailRegex = /^\S+@\S+\.\S+$/;
                isValid = isValid && emailRegex.test(input.value);
                console.log("Email validation result:", emailRegex.test(input.value));
            } else if (input.type === 'tel') {
                const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
                isValid = isValid && phoneRegex.test(input.value);
                console.log("Phone validation result:", phoneRegex.test(input.value));
            } else if (input.classList.contains('currency')) {
                const value = parseInt(input.value.replace(/[^0-9]/g, ''));
                isValid = isValid && !isNaN(value) && value > 0;
                console.log("Currency validation result:", !isNaN(value) && value > 0);
            } else {
                isValid = isValid && input.value.trim() !== '';
                console.log("General field validation result:", input.value.trim() !== '');
            }
            
            if (!isValid) {
                input.classList.add('error-input');
            } else {
                input.classList.remove('error-input');
            }
        });
        
        console.log("✅ Final validation result for section:", isValid ? "✔️ Passed" : "❌ Failed");
        return isValid;
    };
    
    console.log("✅ validateSection function is now globally available.");
    
    // Calculate interest rate based on FICO score and loan amount
    function calculateInterestRate(creditScore, loanAmount) {
        const amount = parseInt(loanAmount.replace(/[^0-9]/g, ''));
        const score = parseInt(creditScore);
        
        if (score >= 760) {
            if (amount < 10000) return 15.99;
            if (amount <= 75000) return 14.99;
            if (amount <= 150000) return 13.99;
            return 12.99;
        } else if (score >= 720) {
            if (amount < 10000) return 16.99;
            if (amount <= 75000) return 15.99;
            if (amount <= 150000) return 14.99;
            return 13.99;
        } else if (score >= 680) {
            if (amount < 10000) return 17.99;
            if (amount <= 75000) return 16.99;
            if (amount <= 150000) return 15.99;
            return 14.99;
        } else if (score >= 640) {
            if (amount < 10000) return 18.99;
            if (amount <= 75000) return 17.99;
            return null;
        }
        return null;
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
        
        // Update the term slider range based on loan amount
        const { minTerm, maxTerm } = calculateTermRange(amount);
        termSlider.min = minTerm;
        termSlider.max = maxTerm;
        
        // Adjust the value if it's outside the new range
        if (parseInt(termSlider.value) < minTerm) {
            termSlider.value = minTerm;
        } else if (parseInt(termSlider.value) > maxTerm) {
            termSlider.value = maxTerm;
        }
        
        // Update term labels
        const termLabels = document.querySelector('.term-labels');
        if (termLabels) {
            const spans = termLabels.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].textContent = `${minTerm} months`;
                spans[2].textContent = `${maxTerm} months`;
                spans[1].textContent = `${termSlider.value} months`;
            }
        }
        
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
    
    // Add term slider event listener
    const termSlider = document.getElementById('term-slider');
    if (termSlider) {
        termSlider.addEventListener('input', function() {
            const currentTermElement = document.getElementById('current-term');
            if (currentTermElement) {
                currentTermElement.textContent = `${this.value} months`;
            }
            updatePaymentCalculator();
        });
    }
    
    // Set up navigation buttons - NEXT buttons
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Next button clicked!");
            
            const currentSection = sections[currentSectionIndex];
            
            if (validateSection(currentSection)) {
                console.log("Validation passed, moving to next section...");
                
                // If moving to the payment calculator section, update it first
                if (currentSectionIndex === 3) {
                    updatePaymentCalculator();
                }
                
                showSection(currentSectionIndex + 1);
            } else {
                console.error("Validation failed. Check required fields.");
            }
        });
    });
    
    // Set up navigation buttons - BACK buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Back button clicked!");
            
            if (currentSectionIndex > 0) {
                showSection(currentSectionIndex - 1);
            }
        });
    });
    
    // Form submission handler for Salesforce
    if (form) {
        console.log("Form found, setting up submission handler", form);
        console.log("Form action:", form.action);
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submission started");
            
            const currentSection = sections[currentSectionIndex];
            if (!validateSection(currentSection)) {
                console.error("Validation failed, stopping submission");
                return;
            }
            
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
                console.log("Loading screen displayed");
            }
            
            // Store form data in localStorage for retrieval on complete page
            const formData = new FormData(form);
            const formDataObj = {};
            
            // Get loan amount and purpose for the redirect
            const loanAmountElement = document.getElementById('00NHs00000lzslH');
            const loanPurposeElement = document.getElementById('00NHs00000scaqg');
            let loanAmount = '';
            const loanPurpose = loanPurposeElement ? loanPurposeElement.value : '';
            
            // Format loan amount as currency for storage
            if (loanAmountElement && loanAmountElement.value) {
                // Extract numeric value
                const numericAmount = parseInt(loanAmountElement.value.replace(/[^0-9]/g, ''));
                if (!isNaN(numericAmount)) {
                    // Format as currency - force the dollar sign by prepending it
                    loanAmount = '$' + numericAmount.toLocaleString('en-US');
                } else {
                    loanAmount = loanAmountElement.value; // Keep original value if parsing fails
                }
            } else {
                loanAmount = '';
            }
            
            // Store loan details separately for easier access on the complete page
            localStorage.setItem('loan_amount', loanAmount);
            localStorage.setItem('loan_purpose', loanPurpose);
            
            // Store all form fields
            for (let [key, value] of formData.entries()) {
                formDataObj[key] = value;
                console.log(`${key}: ${value}`);
            }
            
            // Also add these values to hidden fields to pass in the form submission
            const loanAmountParamField = document.getElementById('loan_amount_param');
            const loanPurposeParamField = document.getElementById('loan_purpose_param');
            
            if (loanAmountParamField && loanAmount) {
                loanAmountParamField.value = loanAmount;
            }
            
            if (loanPurposeParamField && loanPurpose) {
                loanPurposeParamField.value = loanPurpose;
            }
            
            // Save form data to localStorage
            try {
                localStorage.setItem('prequalFormData', JSON.stringify(formDataObj));
                console.log("Form data saved to localStorage");
            } catch (e) {
                console.error("Failed to save form data to localStorage:", e);
            }
            
            // Ensure the form has an action URL
            if (!form.action || form.action.trim() === '') {
                alert('Form is missing action URL');
                if (loadingScreen) loadingScreen.classList.add('hidden');
                return;
            }
            
            // Set a flag in localStorage to indicate form was submitted
            localStorage.setItem('formSubmitted', 'true');
            
            // Submit the form traditionally
            form.submit();
        });
    } else {
        console.error("Form element not found - form submission handler not initialized");
    }
    
    console.log("✅ Prequalification.js fully loaded and executed.");
});
