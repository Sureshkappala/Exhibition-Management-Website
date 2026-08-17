/* ==========================================================================
   DISASTER RELIEF FOUNDATION - JavaScript Form Validation & Security
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggles();
    initRealTimeFilters();
    initFormValidators();
});

/**
 * 1. Password Toggle (Show/Hide password)
 */
function initPasswordToggles() {
    const toggles = document.querySelectorAll('.password-toggle-icon');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const wrapper = toggle.closest('.password-input-wrapper');
            if (!wrapper) return;
            const input = wrapper.querySelector('input');
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                // Change eye SVG to eye-slash
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        <path d="M2 2l20 20" stroke="currentColor" stroke-width="2" />
                    </svg>
                `;
            } else {
                input.type = 'password';
                // Change back to regular eye SVG
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                `;
            }
        });
    });
}

/**
 * 2. Real-Time Keystroke Filters (Prevent unwanted characters)
 */
function initRealTimeFilters() {
    // Filter Name fields to allow letters and spaces only (prevent numbers/special characters)
    const nameInputs = document.querySelectorAll('input[name*="name"], input[id*="name"], input[name*="Name"], input[id*="Name"]');
    nameInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const cursorPosition = input.selectionStart;
            const originalLength = input.value.length;
            
            // Allow letters, spaces, accents, and hyphens only
            const cleanValue = input.value.replace(/[^a-zA-Z\s\-']/g, '');
            
            if (input.value !== cleanValue) {
                input.value = cleanValue;
                // Keep the cursor position stable
                const diff = originalLength - cleanValue.length;
                input.setSelectionRange(cursorPosition - diff, cursorPosition - diff);
            }
        });
    });

    // Filter Mobile/Phone fields to allow numbers only (prevent letters/spaces/symbols)
    const mobileInputs = document.querySelectorAll('input[type="tel"], input[name*="mobile"], input[id*="mobile"], input[name*="phone"], input[id*="phone"]');
    mobileInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const cursorPosition = input.selectionStart;
            const originalLength = input.value.length;
            
            // Allow numbers and starting '+' sign for international formatting
            let cleanValue = input.value.replace(/[^0-9+]/g, '');
            
            // Ensure '+' can only appear as the very first character
            if (cleanValue.includes('+')) {
                cleanValue = '+' + cleanValue.replace(/\+/g, '');
            }
            
            if (input.value !== cleanValue) {
                input.value = cleanValue;
                const diff = originalLength - cleanValue.length;
                input.setSelectionRange(cursorPosition - diff, cursorPosition - diff);
            }
        });
    });
}

/**
 * 3. Validation Helpers
 */
const validators = {
    name: (val) => {
        if (!val || val.trim() === '') return 'Name is required.';
        if (!/^[a-zA-Z\s\-']+$/.test(val)) return 'Name can only contain letters, spaces, and hyphens.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return null;
    },
    email: (val) => {
        if (!val || val.trim() === '') return 'Email address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return 'Please enter a valid email address.';
        return null;
    },
    mobile: (val) => {
        if (!val || val.trim() === '') return 'Mobile number is required.';
        // Remove leading '+' for length checks
        const numbersOnly = val.replace(/\D/g, '');
        if (numbersOnly.length < 10 || numbersOnly.length > 15) {
            return 'Mobile number must be between 10 and 15 digits.';
        }
        return null;
    },
    password: (val) => {
        if (!val) return 'Password is required.';
        if (val.length < 6) return 'Password must be at least 6 characters.';
        return null;
    },
    confirmPassword: (val, originalVal) => {
        if (!val) return 'Please confirm your password.';
        if (val !== originalVal) return 'Passwords do not match.';
        return null;
    },
    required: (val, fieldName = 'This field') => {
        if (!val || (typeof val === 'string' && val.trim() === '')) {
            return `${fieldName} is required.`;
        }
        return null;
    },
    checkbox: (checked, fieldName = 'Terms and Conditions') => {
        if (!checked) return `You must accept the ${fieldName}.`;
        return null;
    }
};

/**
 * 4. Apply Validators to Forms
 */
function initFormValidators() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.setAttribute('novalidate', 'true'); // Disable default HTML5 validation bubbles
        
        form.addEventListener('submit', (e) => {
            let hasErrors = false;
            
            // Get all inputs to validate
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                const error = validateField(input, form);
                if (error) {
                    showError(input, error);
                    hasErrors = true;
                } else {
                    clearError(input);
                }
            });
            
            if (hasErrors) {
                e.preventDefault();
                // Scroll to the first error
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            } else {
                // If it's a demonstration project, mock form success instead of real submission
                e.preventDefault();
                const formId = form.id || '';
                if (formId.includes('volunteer') || formId.includes('contact')) {
                    window.location.href = '404.html';
                } else {
                    displaySuccessState(form);
                }
            }
        });
        
        // Add real-time field validation on input, blur, and change
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            ['blur', 'change'].forEach(evt => {
                input.addEventListener(evt, () => {
                    const error = validateField(input, form);
                    if (error) {
                        showError(input, error);
                    } else {
                        clearError(input);
                    }
                });
            });

            // Smart real-time validation on typing
            input.addEventListener('input', () => {
                const name = input.name || input.id || '';
                const isPasswordType = input.type === 'password' || name.includes('password');
                
                // If already marked invalid, or if typing in password/confirm-password fields, validate instantly
                if (input.classList.contains('is-invalid') || isPasswordType) {
                    const error = validateField(input, form);
                    if (error) {
                        showError(input, error);
                    } else {
                        clearError(input);
                    }
                    
                    // Cross-input validation: If editing primary password, update confirm-password validation if it was already filled
                    if (name === 'password') {
                        const confirmInput = form.querySelector('input[name="confirm-password"], input[id="confirm-password"], input[name="confirm_password"]');
                        if (confirmInput && (confirmInput.value !== '' || confirmInput.classList.contains('is-invalid'))) {
                            const confirmError = validateField(confirmInput, form);
                            if (confirmError) {
                                showError(confirmInput, confirmError);
                            } else {
                                clearError(confirmInput);
                            }
                        }
                    }
                }
            });
        });
    });
}

/**
 * Validate a specific field based on its attributes
 */
function validateField(input, form) {
    const val = input.value;
    const type = input.type;
    const name = input.name || input.id;
    const isRequired = input.hasAttribute('required');
    
    // 1. Required Check
    if (isRequired) {
        if (type === 'checkbox') {
            if (!input.checked) return validators.checkbox(false, input.dataset.fieldName || 'Terms');
        } else {
            if (!val || val.trim() === '') {
                return validators.required(val, input.placeholder || name);
            }
        }
    }
    
    // If not required and empty, skip other validation rules
    if (!isRequired && (!val || val.trim() === '')) {
        return null;
    }
    
    // 2. Specific Validation Checks based on Name/Type
    if (name.toLowerCase().includes('name')) {
        return validators.name(val);
    }
    if (type === 'email' || name.toLowerCase().includes('email')) {
        return validators.email(val);
    }
    if (type === 'tel' || name.toLowerCase().includes('mobile') || name.toLowerCase().includes('phone')) {
        return validators.mobile(val);
    }
    if (name === 'password' || name === 'password-input') {
        return validators.password(val);
    }
    if (name === 'confirm-password' || name === 'confirm_password') {
        const originalPasswordInput = form.querySelector('input[name="password"], input[id="password"]');
        const originalVal = originalPasswordInput ? originalPasswordInput.value : '';
        return validators.confirmPassword(val, originalVal);
    }
    
    return null;
}

/**
 * UI Error Rendering Helpers
 */
function showError(input, message) {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    
    // Find or create invalid-feedback element
    let feedback = input.nextElementSibling;
    if (input.closest('.password-input-wrapper')) {
        feedback = input.closest('.password-input-wrapper').nextElementSibling;
    }
    
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    } else {
        // Create element dynamically if missing
        const div = document.createElement('div');
        div.className = 'invalid-feedback';
        div.textContent = message;
        if (input.closest('.password-input-wrapper')) {
            input.closest('.password-input-wrapper').after(div);
        } else {
            input.after(div);
        }
    }
}

function clearError(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}

/**
 * Dynamic Form Success Popup overlay
 */
function displaySuccessState(form) {
    // Generate success popup overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(10, 25, 47, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s ease';
    
    // Content box
    const card = document.createElement('div');
    card.style.backgroundColor = 'var(--color-bg-white)';
    card.style.padding = '40px';
    card.style.borderRadius = 'var(--radius-lg)';
    card.style.boxShadow = 'var(--shadow-lg)';
    card.style.maxWidth = '450px';
    card.style.width = '90%';
    card.style.textAlign = 'center';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    
    // Determine the type of success based on form ID or location
    let title = "Thank You!";
    let desc = "Your submission was received. We will get back to you shortly.";
    let btnText = "Return";
    let redirectUrl = null;
    
    const formId = form.id || '';
    if (formId.includes('volunteer')) {
        title = "Welcome Aboard!";
        desc = "Your volunteer application has been successfully submitted. Our rescue coordination team will review it and get in touch within 24 hours.";
        btnText = "Return";
        redirectUrl = null;
    } else if (formId.includes('donate')) {
        title = "Donation Received!";
        desc = "Thank you for your generous contribution. Your funds have been allocated to the active disaster response program. A receipt has been sent to your email.";
        btnText = "Go to Donor Dashboard";
        redirectUrl = "dashboard-user.html";
    } else if (formId.includes('login')) {
        title = "Login Successful!";
        desc = "Redirecting you to the system portal...";
        btnText = "Go to Dashboard";
        
        // Custom redirection logic based on selected access role dropdown or email override
        const roleVal = form.querySelector('#role')?.value || '';
        const emailVal = form.querySelector('input[type="email"]')?.value || '';
        
        localStorage.setItem('currentUserEmail', emailVal || 'user@stackly.org');
        let displayName = (emailVal || 'user@stackly.org').split('@')[0];
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        localStorage.setItem('currentUserName', displayName);
        
        if (roleVal === 'admin' || emailVal.toLowerCase().includes('admin')) {
            redirectUrl = "dashboard-admin.html";
        } else {
            redirectUrl = "dashboard-user.html";
        }
    } else if (formId.includes('register')) {
        title = "Registration Complete!";
        desc = "Your account has been created successfully. Welcome to the Disaster Relief Foundation.";
        btnText = "Login Now";
        redirectUrl = "login.html";
        
        const emailVal = form.querySelector('input[type="email"]')?.value || '';
        const nameVal = form.querySelector('input[name*="name"], input[id*="name"], input[name*="Name"], input[id*="Name"]')?.value || '';
        if (emailVal) localStorage.setItem('currentUserEmail', emailVal);
        if (nameVal) localStorage.setItem('currentUserName', nameVal);
    } else if (formId.includes('contact')) {
        title = "Message Sent!";
        desc = "Thank you for reaching out. Our emergency operations center has received your inquiry.";
        btnText = "Back to Home";
        redirectUrl = "index.html";
    }
    
    card.innerHTML = `
        <div style="width: 70px; height: 70px; background-color: rgba(46, 196, 182, 0.1); color: var(--color-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <svg style="width: 36px; height: 36px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        </div>
        <h3 style="font-size: 1.6rem; font-weight: 700; color: var(--color-primary); margin-bottom: 12px;">${title}</h3>
        <p style="color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 30px; line-height: 1.5;">${desc}</p>
        <button id="success-close-btn" class="btn btn-primary btn-block">${btnText}</button>
    `;
    
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);
    
    // Auto-redirect if login success after 1.5 seconds
    if (formId.includes('login') && redirectUrl) {
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
    }
    
    // Click button to close or redirect
    const btn = card.querySelector('#success-close-btn');
    btn.addEventListener('click', () => {
        // Animate out
        overlay.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                form.reset();
                // remove is-valid classes
                form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
            }
        }, 300);
    });
}
