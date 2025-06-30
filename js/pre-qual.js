document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isSubmitted = urlParams.get('submitted') === 'true';

  const formSections = document.querySelectorAll('.section');
  const calculator = document.getElementById('payment-calculator');
  const completion = document.getElementById('completion-screen');

  // Show calculator if redirected from Salesforce with submitted=true
  if (isSubmitted) {
    formSections.forEach(section => section.classList.add('hidden'));
    if (calculator) calculator.classList.remove('hidden');
    if (completion) completion.classList.remove('hidden');
  } else {
    if (calculator) calculator.classList.add('hidden');
    if (completion) completion.classList.add('hidden');
  }

  let currentSectionIndex = 0;

  const sections = document.querySelectorAll('.section');
  const progressBar = document.querySelector('.progress-bar-fill');
  const progressText = document.querySelector('.progress-text');
  const form = document.getElementById("prequalForm");
  const loadingScreen = document.getElementById('loading-screen');

  function showSection(index) {
    if (index < 0 || index >= sections.length) return;
    sections.forEach(section => section.classList.add('hidden'));
    sections[index].classList.remove('hidden');
    currentSectionIndex = index;
    updateProgressBar(index);
  }

  function updateProgressBar(index) {
    const totalSections = sections.length;
    const progress = ((index + 1) / totalSections) * 100;
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `Step ${index + 1} of ${totalSections}`;
  }

  showSection(0);

  function initializeGooglePlaces() {
    const addressInput = document.getElementById("autocomplete");
    if (!addressInput) return;
    const options = { types: ['address'], componentRestrictions: { country: 'us' } };
    const autocomplete = new google.maps.places.Autocomplete(addressInput, options);

    google.maps.event.addListener(autocomplete, "place_changed", function () {
      const place = autocomplete.getPlace();
      let streetNumber = "", route = "", city = "", state = "", zipCode = "";
      for (const component of place.address_components || []) {
        const type = component.types[0];
        switch (type) {
          case "street_number": streetNumber = component.long_name; break;
          case "route": route = component.long_name; break;
          case "locality": city = component.long_name; break;
          case "administrative_area_level_1": state = component.short_name; break;
          case "postal_code": zipCode = component.long_name; break;
        }
      }
      document.getElementById("street").value = `${streetNumber} ${route}`.trim();
      document.getElementById("city").value = city;
      document.getElementById("state").value = state;
      document.getElementById("zip").value = zipCode;
    });
  }

  window.onload = function () {
    if (typeof google !== "undefined" && google.maps && google.maps.places) {
      initializeGooglePlaces();
    }
  };

  const loanPurpose = document.getElementById('00NHs00000scaqg');
  const otherPurpose = document.getElementById('other-purpose');
  const otherPurposeText = document.getElementById('00NQP000003JB1F');

  if (loanPurpose) {
    loanPurpose.addEventListener('change', function () {
      const isOther = this.value === 'Other';
      otherPurpose.classList.toggle('hidden', !isOther);
      otherPurposeText.required = isOther;
      if (!isOther) otherPurposeText.value = '';
    });
  }

  const businessEstablished = document.getElementById('00NHs00000lzslM');
  const yearsContainer = document.getElementById('years-container');
  const yearsInput = document.getElementById('00NHs00000m08cv');

  if (businessEstablished) {
    businessEstablished.addEventListener('change', function () {
      const isEstablished = this.value === 'Yes';
      yearsContainer.classList.toggle('hidden', !isEstablished);
      yearsInput.required = isEstablished;
      if (!isEstablished) yearsInput.value = '';
    });
  }

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

  function validateSection(section) {
    const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    inputs.forEach(input => {
      const val = input.value.trim();
      if (input.type === 'email') {
        isValid = /^\S+@\S+\.\S+$/.test(val) && isValid;
      } else if (input.type === 'tel') {
        isValid = /^\(\d{3}\) \d{3}-\d{4}$/.test(val) && isValid;
      } else {
        isValid = val !== '' && isValid;
      }
      input.classList.toggle('error-input', !isValid);
    });
    return isValid;
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
    const loanAmtField = document.getElementById('00NHs00000lzslH');
    const creditScoreField = document.getElementById('00NHs00000m08cg');
    const termSlider = document.getElementById('term-slider');
    const monthlyDisplay = document.getElementById('monthly-payment');
    const rateText = document.getElementById('rate-text');
    const currentTerm = document.getElementById('current-term');

    const amount = parseInt(loanAmtField.value.replace(/[^0-9]/g, ''));
    const score = creditScoreField.value;
    const rate = calculateInterestRate(score, amount);
    const term = parseInt(termSlider.value);

    if (rate === null) {
      rateText.textContent = 'Contact us for rate details.';
      monthlyDisplay.textContent = 'Contact us';
      return;
    }

    const payment = calculateMonthlyPayment(amount, rate, term);
    monthlyDisplay.textContent = payment.toLocaleString('en-US', {
      style: 'currency', currency: 'USD'
    });
    rateText.textContent = `Your estimated interest rate is ${rate}% APR`;
    currentTerm.textContent = `${term} months`;
  }

  document.querySelectorAll('.next-button').forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      const currentSection = sections[currentSectionIndex];
      if (validateSection(currentSection)) {
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

  // Form submit handler to inject retURL with query params
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateSection(sections[currentSectionIndex])) return;

      if (loadingScreen) loadingScreen.classList.remove('hidden');

      const loanAmountField = document.getElementById('00NHs00000lzslH');
      const loanPurposeField = document.getElementById('00NHs00000scaqg');
      const loanAmount = loanAmountField ? loanAmountField.value.replace(/[^0-9]/g, '') : '';
      const loanPurpose = loanPurposeField ? loanPurposeField.value : '';

      // Save to localStorage for use in completion screen
      localStorage.setItem('loan_amount', `$${parseInt(loanAmount).toLocaleString()}`);
      localStorage.setItem('loan_purpose', loanPurpose);

      const retInput = document.querySelector('input[name="retURL"]');
      retInput.value = `https://prequal.4fimd.com/?submitted=true&amount=${loanAmount}&purpose=${encodeURIComponent(loanPurpose)}`;

      const formData = new FormData(form);
      const obj = {};
      for (let [k, v] of formData.entries()) obj[k] = v;
      localStorage.setItem('prequalFormData', JSON.stringify(obj));
      localStorage.setItem('formSubmitted', 'true');

      // Allow native submit after retURL is updated
      form.submit();
    });
  }

  // Delay clearing localStorage in calculator DOM to avoid race condition
  if (isSubmitted) {
    setTimeout(() => {
      localStorage.removeItem('formSubmitted');
      localStorage.removeItem('prequalFormData');
      localStorage.removeItem('loan_amount');
      localStorage.removeItem('loan_purpose');
    }, 2000);
  }
});
