// Declare shared variables up top
let formSections = [];
let currentSectionIndex = 0;
let isAnimating = false;
let isSubmitted = false;
let calculator = null;
let completion = null;
let form = null;
let loadingScreen = null;

document.addEventListener('DOMContentLoaded', function () {
  console.log("🧠 DOM ready. Is submitted:", isSubmitted);
  const urlParams = new URLSearchParams(window.location.search);
  isSubmitted = urlParams.get('submitted') === 'true';

// === CONDITIONAL FIELD LOGIC (clean version) ===

// Loan Purpose → show/hide "Other"
const loanPurpose = document.getElementById('00NHs00000scaqg');
const otherPurpose = document.getElementById('other-purpose');
const otherPurposeText = document.getElementById('00NQP000003JB1F');

if (loanPurpose) {
  loanPurpose.addEventListener('change', function () {
    const isOther = this.value === 'Other';
    otherPurpose.classList.toggle('hidden', !isOther);
    otherPurposeText.required = isOther;
    if (!isOther) {
      otherPurposeText.value = '';
    }
  });

  // Run it once on load to apply current value
  loanPurpose.dispatchEvent(new Event('change'));
}

// Business Established → show/hide "Years in Business"
const businessEstablished = document.getElementById('00NHs00000lzslM');
const yearsContainer = document.getElementById('years-container');
const yearsInput = document.getElementById('00NHs00000m08cv');

if (businessEstablished) {
  businessEstablished.addEventListener('change', function () {
    const isEstablished = this.value === 'Yes';
    yearsContainer.classList.toggle('hidden', !isEstablished);
    yearsInput.required = isEstablished;
    if (!isEstablished) {
      yearsInput.value = '';
    }
  });

  // Run it once on load to apply current value
  businessEstablished.dispatchEvent(new Event('change'));
}

  formSections = Array.from(document.querySelectorAll('.section')).filter(s =>
    !['completion-screen', 'payment-calculator'].includes(s.id)
  );
  calculator = document.getElementById('payment-calculator');
  completion = document.getElementById('completion-screen');
  form = document.getElementById("prequalForm");
  loadingScreen = document.getElementById("loading-screen");

  if (isSubmitted) {
  console.log("💡 In 'submitted' mode");

  // Hide all form sections
  formSections.forEach(section => section.classList.add('hidden'));

  // Show loading screen first
  if (loadingScreen) loadingScreen.classList.remove('hidden');

  // Grab loan data from URL or localStorage
  const loanAmount = urlParams.get('amount') || localStorage.getItem('loan_amount') || '$0';
  const purpose = urlParams.get('purpose') || localStorage.getItem('loan_purpose') || 'Not specified';

  // Safely update display fields
  const loanEl = document.getElementById('display-loan-amount');
  const purposeEl = document.getElementById('display-loan-purpose');
  if (loanEl) loanEl.textContent = loanAmount;
  if (purposeEl) purposeEl.textContent = purpose;

  // Load stored score (fallback to 720)
  let storedScore = '720';
  try {
    const storedData = JSON.parse(localStorage.getItem('prequalFormData'));
    if (storedData && storedData['00NHs00000m08cg']) {
      storedScore = storedData['00NHs00000m08cg'];
      const creditScoreField = document.getElementById('00NHs00000m08cg');
      if (creditScoreField) creditScoreField.value = storedScore;
    }
  } catch (e) {
    console.error("⚠️ Error loading stored form data", e);
  }

  // Simulate loading delay, then show results + calculator
  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (completion) completion.classList.remove('hidden');
    if (calculator) calculator.classList.remove('hidden');
    updatePaymentCalculator(); // ensure monthly payment is calculated
  }, 1500);

  // Optional: clear data after showing
  setTimeout(() => {
    localStorage.removeItem('formSubmitted');
    localStorage.removeItem('prequalFormData');
    localStorage.removeItem('loan_amount');
    localStorage.removeItem('loan_purpose');
  }, 3000);
}

  // === INPUT FORMATTING ===
  document.querySelectorAll('.currency:not([readonly])').forEach(input => {
    input.addEventListener('blur', e => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val) e.target.value = `$${parseInt(val, 10).toLocaleString()}`;
    });
    input.addEventListener('focus', e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  });

  const phoneInput = document.getElementById('mobile');
  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 10);
      if (val.length <= 3) val = `(${val}`;
      else if (val.length <= 6) val = `(${val.slice(0, 3)}) ${val.slice(3)}`;
      else val = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
      e.target.value = val;
    });
  }

  // === FORM NAVIGATION ===
  document.querySelectorAll('.next-button').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const current = formSections[currentSectionIndex];
      if (validateSection(current)) {
        showSection(currentSectionIndex + 1);
      }
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      if (currentSectionIndex > 0) showSection(currentSectionIndex - 1);
    });
  });

 // Form submission 
 if (form) {
  console.log("Form found, setting up submission handler", form);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Form submission started");

    const currentSection = formSections[currentSectionIndex];
    if (!validateSection(currentSection)) {
      console.error("Validation failed, stopping submission");
      return;
    }

    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
      console.log("Loading screen displayed");
    }

    const formData = new FormData(form);
    const formDataObj = {};

    const loanAmountElement = document.getElementById('00NHs00000lzslH');
    const loanPurposeElement = document.getElementById('00NHs00000scaqg');
    let loanAmount = '';
    const loanPurpose = loanPurposeElement ? loanPurposeElement.value : '';

    if (loanAmountElement && loanAmountElement.value) {
      const numericAmount = parseInt(loanAmountElement.value.replace(/[^0-9]/g, ''));
      if (!isNaN(numericAmount)) {
        loanAmount = '$' + numericAmount.toLocaleString('en-US');
      } else {
        loanAmount = loanAmountElement.value;
      }
    } else {
      loanAmount = '';
    }

    // Set localStorage for use on the results screen
    localStorage.setItem('loan_amount', loanAmount);
    localStorage.setItem('loan_purpose', loanPurpose);

    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }

    // Also populate hidden fields in the form
    const loanAmountParamField = document.getElementById('loan_amount_param');
    const loanPurposeParamField = document.getElementById('loan_purpose_param');

    if (loanAmountParamField && loanAmount) {
      loanAmountParamField.value = loanAmount;
    }

    if (loanPurposeParamField && loanPurpose) {
      loanPurposeParamField.value = loanPurpose;
    }

    try {
      localStorage.setItem('prequalFormData', JSON.stringify(formDataObj));
      console.log("Form data saved to localStorage");
    } catch (e) {
      console.error("Failed to save form data to localStorage:", e);
    }

    if (!form.action || form.action.trim() === '') {
      alert('Form is missing action URL');
      if (loadingScreen) loadingScreen.classList.add('hidden');
      return;
    }

    localStorage.setItem('formSubmitted', 'true');

    // Submit the form
    form.submit();
  });
} else {
  console.error("Form element not found - form submission handler not initialized");
}


  // === PAYMENT DISPLAY ON REDIRECT ===
  if (isSubmitted) {
    const loanAmount = urlParams.get('amount') || localStorage.getItem('loan_amount') || '$0';
    const purpose = urlParams.get('purpose') || localStorage.getItem('loan_purpose') || 'Not specified';

    document.getElementById('display-loan-amount').textContent = loanAmount;
    document.getElementById('display-loan-purpose').textContent = purpose;

    let storedScore = '720';
    try {
      const storedData = JSON.parse(localStorage.getItem('prequalFormData'));
      if (storedData && storedData['00NHs00000m08cg']) {
        storedScore = storedData['00NHs00000m08cg'];
        document.getElementById('00NHs00000m08cg').value = storedScore;
      }
    } catch (e) {}

    updatePaymentCalculator();

    setTimeout(() => {
      localStorage.removeItem('formSubmitted');
      localStorage.removeItem('prequalFormData');
      localStorage.removeItem('loan_amount');
      localStorage.removeItem('loan_purpose');
    }, 2000);
  }
});

// Form Flow
function showSection(index) {
  if (!formSections || formSections.length === 0) return;
  if (index < 0 || index >= formSections.length) return;

  // Hide all sections
  formSections.forEach((section, i) => {
    section.classList.add('hidden');
  });

  // Show the selected section
  formSections[index].classList.remove('hidden');
  currentSectionIndex = index;

  updateProgressBar(index);
}

function updateProgressBar(index) {
  const progressBar = document.querySelector('.progress-bar-fill');
  const progressText = document.querySelector('.progress-text');
  const total = formSections.length;
  const percent = ((index + 1) / total) * 100;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `Step ${index + 1} of ${total}`;
}

function validateSection(section) {
  const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  inputs.forEach(input => {
    const val = input.value.trim();
    if (input.type === 'email') valid = /^\S+@\S+\.\S+$/.test(val) && valid;
    else if (input.type === 'tel') valid = /^\(\d{3}\) \d{3}-\d{4}$/.test(val) && valid;
    else valid = val !== '' && valid;
    input.classList.toggle('error-input', !valid);
  });
  return valid;
}

function calculateInterestRate(score, amt) {
  score = parseInt(score); amt = parseInt(amt);
  if (score >= 760) return amt < 10000 ? 15.99 : amt <= 75000 ? 14.99 : amt <= 150000 ? 13.99 : 12.99;
  if (score >= 720) return amt < 10000 ? 16.99 : amt <= 75000 ? 15.99 : amt <= 150000 ? 14.99 : 13.99;
  if (score >= 680) return amt < 10000 ? 17.99 : amt <= 75000 ? 16.99 : amt <= 150000 ? 15.99 : 14.99;
  if (score >= 640) return amt < 10000 ? 18.99 : amt <= 75000 ? 17.99 : null;
  return null;
}

function calculateMonthlyPayment(p, r, t) {
  const monthlyRate = r / 100 / 12;
  return p * monthlyRate * Math.pow(1 + monthlyRate, t) /
         (Math.pow(1 + monthlyRate, t) - 1);
}

function updatePaymentCalculator() {
  const amtField = document.getElementById('00NHs00000lzslH');
  const scoreField = document.getElementById('00NHs00000m08cg');
  const rateLabel = document.getElementById('rate-text');
  const termSlider = document.getElementById('term-slider-completion');
  const currentTerm = document.getElementById('current-term-completion');
  const monthlyPaymentDisplay = document.getElementById('monthly-payment-completion');

  if (!amtField || !scoreField || !termSlider || !rateLabel || !currentTerm || !monthlyPaymentDisplay) return;

  const amt = parseInt(amtField.value.replace(/[^0-9]/g, '')) || 0;
  const score = scoreField.value;
  const term = parseInt(termSlider.value);
  const rate = calculateInterestRate(score, amt);

  if (!rate) {
    rateLabel.textContent = 'Contact us for rate details.';
    monthlyPaymentDisplay.textContent = 'Contact us';
    return;
  }

  const payment = calculateMonthlyPayment(amt, rate, term);

  monthlyPaymentDisplay.textContent = payment.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  rateLabel.textContent = `Your estimated interest rate is ${rate}% APR`;
  currentTerm.textContent = `${term} months`;
}

const slider = document.getElementById('term-slider-completion');
if (slider) slider.addEventListener('input', updatePaymentCalculator);
