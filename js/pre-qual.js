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

  formSections = Array.from(document.querySelectorAll('.section')).filter(s =>
    !['completion-screen', 'payment-calculator'].includes(s.id)
  );
  calculator = document.getElementById('payment-calculator');
  completion = document.getElementById('completion-screen');
  form = document.getElementById("prequalForm");
  loadingScreen = document.getElementById("loading-screen");

  if (isSubmitted) {
    console.log("💡 In 'submitted' mode");
    formSections.forEach(section => section.classList.add('hidden'));
    if (calculator) calculator.classList.remove('hidden');
    if (completion) completion.classList.remove('hidden');
  } else {
    console.log("💡 In form mode");
    if (calculator) calculator.classList.add('hidden');
    if (completion) completion.classList.add('hidden');
    showSection(0);
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
        if (currentSectionIndex === 3) updatePaymentCalculator();
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

  // === FORM SUBMIT ===
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateSection(formSections[currentSectionIndex])) return;

      if (loadingScreen) loadingScreen.classList.remove('hidden');

      const amtField = document.getElementById('00NHs00000lzslH');
      const purposeField = document.getElementById('00NHs00000scaqg');
      const amount = amtField ? amtField.value.replace(/[^0-9]/g, '') : '';
      const purpose = purposeField ? purposeField.value : '';

      localStorage.setItem('loan_amount', `$${parseInt(amount).toLocaleString()}`);
      localStorage.setItem('loan_purpose', purpose);

      const retInput = document.querySelector('input[name="retURL"]');
      retInput.value = `https://prequal.4fimd.com/?submitted=true&amount=${amount}&purpose=${encodeURIComponent(purpose)}`;

      const formData = new FormData(form);
      const obj = {};
      for (let [k, v] of formData.entries()) obj[k] = v;
      localStorage.setItem('prequalFormData', JSON.stringify(obj));
      localStorage.setItem('formSubmitted', 'true');

      form.submit();
    });
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
  const slider = document.getElementById('term-slider');
  const display = document.getElementById('monthly-payment');
  const rateLabel = document.getElementById('rate-text');
  const termLabel = document.getElementById('current-term');

  const amt = parseInt(amtField.value.replace(/[^0-9]/g, ''));
  const score = scoreField.value;
  const term = parseInt(slider.value);
  const rate = calculateInterestRate(score, amt);

  if (!rate) {
    rateLabel.textContent = 'Contact us for rate details.';
    display.textContent = 'Contact us';
    return;
  }

  const payment = calculateMonthlyPayment(amt, rate, term);
  display.textContent = payment.toLocaleString('en-US', {
    style: 'currency', currency: 'USD'
  });
  rateLabel.textContent = `Your estimated interest rate is ${rate}% APR`;
  termLabel.textContent = `${term} months`;
}

const slider = document.getElementById('term-slider');
if (slider) slider.addEventListener('input', updatePaymentCalculator);
