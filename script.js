document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Example login credentials
  const validUsername = "admin";
  const validPassword = "1234";

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');

  if (username === validUsername && password === validPassword) {
    errorMsg.style.color = "green";
    errorMsg.textContent = "Login successful!";
    
    // Show in browser Developer Console
    console.log("Login successful!");

    // Redirect to YouTube in the same tab
    window.location.assign("https://www.youtube.com/");
  } else {
    errorMsg.style.color = "red";
    errorMsg.textContent = "Invalid username or password.";
    // Only show this message for incorrect credentials
    console.log("Login failed: wrong credentials.");
  }
});

// Toggle between Login and Sign Up forms
const loginForm = document.getElementById('loginForm');
const signUpForm = document.getElementById('signUpForm');
const forgotForm = document.getElementById('forgotForm');
const otpForm = document.getElementById('otpForm');
const resetForm = document.getElementById('resetForm');
const showSignUp = document.getElementById('showSignUp');
const showLogin = document.getElementById('showLogin');
const showForgot = document.getElementById('showForgot');
const backToLogin = document.getElementById('backToLogin');
const errorMsg = document.getElementById('errorMsg');
const signUpMsg = document.getElementById('signUpMsg');

// Store users in-memory (for demo only)
let users = [];
// Load users from localStorage if available
if (localStorage.getItem('allUsers')) {
  users = JSON.parse(localStorage.getItem('allUsers'));
} else {
  users = [{ username: "admin", password: "1234" }];
  localStorage.setItem('allUsers', JSON.stringify(users));
}

let otp = null;
let otpUser = null;

// Save current form to localStorage when switching
function showForm(formName) {
  loginForm.style.display = 'none';
  signUpForm.style.display = 'none';
  forgotForm.style.display = 'none';
  otpForm.style.display = 'none';
  resetForm.style.display = 'none';
  if (formName === 'login') loginForm.style.display = 'block';
  if (formName === 'signup') signUpForm.style.display = 'block';
  if (formName === 'forgot') forgotForm.style.display = 'block';
  if (formName === 'otp') otpForm.style.display = 'block';
  if (formName === 'reset') resetForm.style.display = 'block';
  localStorage.setItem('activeForm', formName);
}

showSignUp.addEventListener('click', function(e) {
  e.preventDefault();
  showForm('signup');
  // Only show 'Sign Up' in the form title if you want, otherwise remove dynamic title change
});

showLogin.addEventListener('click', function(e) {
  e.preventDefault();
  showForm('login');
  // Clear the sign up form fields and reset reCAPTCHA if present
  if (signUpForm) {
    signUpForm.reset();
    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
    // Clear any sign up error messages, including 'This email is already registered.'
    signUpMsg.textContent = '';
  }
  // Only show 'Login' in the form title if you want, otherwise remove dynamic title change
});

showForgot.addEventListener('click', function(e) {
  e.preventDefault();
  showForm('forgot');
});

backToLogin.addEventListener('click', function(e) {
  e.preventDefault();
  showForm('login');
});

// Navbar Sign Up link scrolls to sign up form
const navSignUp = document.getElementById('navSignUp');
if (navSignUp) {
  navSignUp.addEventListener('click', function(e) {
    e.preventDefault();
    showForm('signup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// On page load, restore last active form (do not reset forms, do not show login by default)
document.addEventListener('DOMContentLoaded', function() {
  // Only show the last active form, do not reset any forms or set login by default
  const activeForm = localStorage.getItem('activeForm') || 'login';
  showForm(activeForm);
});

// Update login logic to use users array
loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  // Always use the latest users from localStorage
  users = JSON.parse(localStorage.getItem('allUsers')) || users;
  // Allow login with username or phone
  const user = users.find(u => (u.username === username || u.phone === username) && u.password === password);
  if (user) {
    errorMsg.style.color = "green";
    errorMsg.textContent = "Login successful!";
    console.log("Login successful!");
    // Clear login form fields after successful login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    // Redirect immediately for faster experience
    window.location.assign("https://www.youtube.com/");
  } else {
    errorMsg.style.color = "red";
    errorMsg.textContent = "Invalid username or password.";
    // Only show this message for incorrect credentials
    console.log("Login failed: wrong credentials.");
  }
});

// reCAPTCHA v2 integration for sign up
if (signUpForm) {
  signUpForm.addEventListener('submit', function(event) {
    event.preventDefault();
    // reCAPTCHA v2 validation
    if (typeof grecaptcha !== 'undefined') {
      var response = grecaptcha.getResponse();
      if (!response) {
        signUpMsg.style.color = "red";
        signUpMsg.textContent = "Please complete the reCAPTCHA.";
        return;
      }
    }
    const newContact = document.getElementById('newContact').value.trim();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phoneRegex = /^\d{10,15}$/;
    let userObj = {};
    let successMsg = '';
    if (emailRegex.test(newContact)) {
      // Check if email is already registered
      if (users.some(u => u.email === newContact)) {
        signUpMsg.style.color = "red";
        signUpMsg.textContent = "This email is already registered.";
        return;
      }
      userObj.email = newContact;
      successMsg = 'Sign up successful! Your credentials have been sent to your email.';
    } else if (phoneRegex.test(newContact)) {
      // Check if phone is already registered
      if (users.some(u => u.phone === newContact)) {
        signUpMsg.style.color = "red";
        signUpMsg.textContent = "This phone number is already registered.";
        return;
      }
      userObj.phone = newContact;
      successMsg = 'Sign up successful! Your credentials have been sent to your phone number.';
    } else {
      signUpMsg.style.color = "red";
      signUpMsg.textContent = "Please enter a valid email or phone number.";
      return;
    }
    // Generate random username and password
    const username = 'user_' + Math.floor(Math.random() * 1000000);
    const password = Math.random().toString(36).slice(-8);
    userObj.username = username;
    userObj.password = password;
    users.push(userObj);
    // Save all users to localStorage
    localStorage.setItem('allUsers', JSON.stringify(users));
    // Show credentials in Developer Tools for demo
    console.log('New user credentials:', userObj);
    // Save credentials to localStorage for re-login
    localStorage.setItem('lastUserCredentials', JSON.stringify({ username, password }));
    signUpMsg.style.color = "green";
    signUpMsg.textContent = successMsg;
    setTimeout(() => {
      signUpForm.reset();
      if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
      showForm('login');
      signUpMsg.textContent = '';
    }, 1800);
  });
}

// Invisible reCAPTCHA v2 integration for sign up
function onSignUpSubmit(token) {
  const signUpForm = document.getElementById('signUpForm');
  const signUpMsg = document.getElementById('signUpMsg');
  const newUsername = document.getElementById('newUsername').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  if (newPassword !== confirmPassword) {
    signUpMsg.style.color = "red";
    signUpMsg.textContent = "Passwords do not match.";
    grecaptcha.reset();
    return;
  }
  if (users.some(u => u.username === newUsername)) {
    signUpMsg.style.color = "red";
    signUpMsg.textContent = "Username already exists.";
    grecaptcha.reset();
    return;
  }
  users.push({ username: newUsername, password: newPassword });
  signUpMsg.style.color = "green";
  signUpMsg.textContent = "Sign up successful! reCAPTCHA verified. You can now log in.";
  setTimeout(() => {
    signUpForm.reset();
    signUpForm.style.display = 'none';
    loginForm.style.display = 'block';
    grecaptcha.reset();
  }, 1500);
}

// Prevent default submit for signUpForm (let reCAPTCHA handle it)
if (signUpForm) {
  signUpForm.addEventListener('submit', function(event) {
    event.preventDefault();
  });
}

forgotForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const input = document.getElementById('forgotInput').value.trim();
  const forgotMsg = document.getElementById('forgotMsg');
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const phoneRegex = /^\d{10,15}$/;
  let user = null;
  let otpMsgText = '';
  if (emailRegex.test(input)) {
    user = users.find(u => u.email === input);
    if (!user) {
      forgotMsg.style.color = 'red';
      forgotMsg.textContent = 'This email is not registered.';
      return;
    }
    otpMsgText = 'OTP has been sent to your email.';
  } else if (phoneRegex.test(input)) {
    user = users.find(u => u.phone === input);
    if (!user) {
      forgotMsg.style.color = 'red';
      forgotMsg.textContent = 'This phone number is not registered.';
      return;
    }
    otpMsgText = 'OTP has been sent to your phone number.';
  } else {
    user = users.find(u => u.username === input);
    if (!user) {
      forgotMsg.style.color = 'red';
      forgotMsg.textContent = 'This username is not registered.';
      return;
    }
    otpMsgText = 'OTP has been sent to your email or phone number.';
  }
  // Log the registered username in Developer Tools
  if (user) {
    console.log('Registered username for password reset:', user.username);
  }
  forgotMsg.style.color = 'green';
  forgotMsg.textContent = otpMsgText;
  otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpUser = null;
  // Store the identifier for reset
  localStorage.setItem('lastForgotEmail', input);
  // Log OTP to Developer Tools console for demo
  console.log('Your OTP (for demo):', otp);
  setTimeout(() => {
    showForm('otp');
    document.getElementById('otpMsg').textContent = '';
  }, 1200);
});

// OTP form logic
const resendOtpBtn = document.getElementById('resendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
let otpResendTimeout = null;
let otpResendMsgTimer = null;
let lastOtpResendTime = 0;

if (resendOtpBtn && verifyOtpBtn) {
  // Show only Verify OTP initially
  resendOtpBtn.style.display = 'none';
  verifyOtpBtn.style.display = '';
  resendOtpBtn.addEventListener('click', function() {
    // Only allow showing the resend message once every 3 minutes
    const now = Date.now();
    if (!lastOtpResendTime || now - lastOtpResendTime > 180000) {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Re-sent OTP (for demo):', otp);
      lastOtpResendTime = now;
      const forgotInput = localStorage.getItem('lastForgotEmail') || '';
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      const phoneRegex = /^\d{10,15}$/;
      let otpMsgText = 'A new OTP has been sent to your email or phone number.';
      if (emailRegex.test(forgotInput)) {
        otpMsgText = 'A new OTP has been sent to your email.';
      } else if (phoneRegex.test(forgotInput)) {
        otpMsgText = 'A new OTP has been sent to your phone number.';
      }
      const otpMsg = document.getElementById('otpMsg');
      otpMsg.style.color = 'blue';
      otpMsg.textContent = otpMsgText;
      // Hide the message after 3 minutes
      if (otpResendMsgTimer) clearTimeout(otpResendMsgTimer);
      otpResendMsgTimer = setTimeout(() => {
        otpMsg.textContent = '';
      }, 180000);
    }
    resendOtpBtn.style.display = 'none';
    verifyOtpBtn.style.display = '';
    // Clear OTP input box on resend
    document.getElementById('otpInput').value = '';
  });
}
otpForm.addEventListener('submit', function(event) {
  event.preventDefault();
  // Always clear the OTP input box on submit
  const otpInput = document.getElementById('otpInput');
  const enteredOtp = otpInput.value;
  const otpMsg = document.getElementById('otpMsg');
  if (enteredOtp !== otp) {
    otpMsg.style.color = 'red';
    otpMsg.textContent = 'Invalid OTP. Please re-send OTP.';
    if (resendOtpBtn && verifyOtpBtn) {
      resendOtpBtn.style.display = '';
      verifyOtpBtn.style.display = 'none';
    }
    // Clear OTP input box on incorrect OTP
    otpInput.value = '';
    return;
  }
  otpMsg.style.color = 'green';
  otpMsg.textContent = 'OTP verified! Please reset your password.';
  if (resendOtpBtn && verifyOtpBtn) {
    resendOtpBtn.style.display = 'none';
    verifyOtpBtn.style.display = '';
  }
  setTimeout(() => {
    showForm('reset');
    document.getElementById('resetMsg').textContent = '';
  }, 1000);
  // Clear OTP input box after successful verification
  otpInput.value = '';
});

resetForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const newPass = document.getElementById('resetPassword').value;
  const confirmPass = document.getElementById('resetConfirmPassword').value;
  const resetMsg = document.getElementById('resetMsg');
  if (newPass !== confirmPass) {
    resetMsg.style.color = 'red';
    resetMsg.textContent = 'Passwords do not match.';
    return;
  }
  const forgotInput = localStorage.getItem('lastForgotEmail');
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const phoneRegex = /^\d{10,15}$/;
  let user = null;
  if (emailRegex.test(forgotInput)) {
    user = users.find(u => u.email === forgotInput);
  } else if (phoneRegex.test(forgotInput)) {
    user = users.find(u => u.phone === forgotInput);
  } else {
    user = users.find(u => u.username === forgotInput);
  }
  if (user) {
    user.password = newPass;
    // Save all users to localStorage
    localStorage.setItem('allUsers', JSON.stringify(users));
    resetMsg.style.color = 'green';
    resetMsg.textContent = 'Password reset successful! Logging you in...';
    // Log the change in Developer Tools
    console.log('Password changed! New credentials:', { username: user.username, password: user.password });
    // Save updated credentials to localStorage for re-login
    localStorage.setItem('lastUserCredentials', JSON.stringify({ username: user.username, password: user.password }));
    setTimeout(() => {
      resetForm.reset();
      showForm('login');
      // Do not prompt 'Login successful!' after password reset
      errorMsg.textContent = '';
      // Clear login form fields after password reset
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    }, 1500);
  } else {
    resetMsg.style.color = 'red';
    resetMsg.textContent = 'User not found for password reset.';
  }
});

// Ensure login form is visible and others are hidden on page load
window.addEventListener('DOMContentLoaded', function() {
  loginForm.style.display = 'block';
  signUpForm.style.display = 'none';
  forgotForm.style.display = 'none';
  otpForm.style.display = 'none';
  resetForm.style.display = 'none';
});

// Google Sign Up/Sign In callback
function handleGoogleSignUp(response) {
  // Decode the JWT to get user info (for demo, not secure for production)
  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
  const data = parseJwt(response.credential);
  // Use email as unique identifier
  let user = users.find(u => u.email === data.email);
  if (user) {
    // If already registered, show error message in red
    signUpMsg.style.color = 'red';
    signUpMsg.textContent = 'This email is already registered.';
    if (googleSignInMsg) {
      googleSignInMsg.style.display = 'none';
    }
    return;
  } else {
    // If not registered, sign up the user with a random strong password
    const randomPassword = generateStrongPassword();
    user = {
      username: data.email.split('@')[0],
      email: data.email,
      password: randomPassword,
      google: true
    };
    users.push(user);
    localStorage.setItem('allUsers', JSON.stringify(users));
    signUpMsg.style.color = 'green';
    signUpMsg.textContent = 'Google sign up successful! Your credentials have been sent to your email.';
    // Log credentials to Developer Tools
    console.log('New user credentials (Google):', { email: user.email, username: user.username, password: randomPassword });
    console.log('Google sign in is successful! Your credentials have been sent to your email.');
    if (googleSignInMsg) {
      googleSignInMsg.style.display = 'none';
    }
    setTimeout(() => {
      showForm('login');
    }, 2000);
  }
}

// Helper to generate a strong random password
function generateStrongPassword() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Chatbot: Add initial welcome and example messages in box format
function addChatbotMessage(message, sender = 'bot') {
  const messagesContainer = document.getElementById('chatbot-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chatbot-message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = message;
  msgDiv.appendChild(bubble);
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show initial messages in box format on chatbot open
const chatbotContainer = document.getElementById('chatbot-container');
if (chatbotContainer) {
  // Only add if not already present
  const messagesContainer = document.getElementById('chatbot-messages');
  if (messagesContainer && messagesContainer.childElementCount === 0) {
    addChatbotMessage("I'm an AI chatbot. How can I assist you?", 'bot');
    addChatbotMessage("Would you help", 'user');
    addChatbotMessage("I'm here to help!", 'bot');
  }
}