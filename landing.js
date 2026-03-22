// ==========================================
// SKYFALL — Landing Page JavaScript
// Light Breezy Sky Theme
// ==========================================

let authState = 'register';

// ==========================================
// AUTHENTICATION MODAL
// ==========================================
function initAuthModal() {
  const registerBtn = document.getElementById('btn-register');
  const navRegisterBtn = document.getElementById('nav-register');
  const modalClose = document.getElementById('modal-close');
  const authModal = document.getElementById('auth-modal');
  const authOverlay = document.getElementById('auth-overlay');
  const toggleBtn = document.getElementById('toggle-btn');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  const openModal = (e) => {
    e.preventDefault?.();
    authModal.classList.add('active');
    authOverlay.classList.add('active');
    authState = 'register';
    showAuthForm('register');
  };

  registerBtn?.addEventListener('click', openModal);
  navRegisterBtn?.addEventListener('click', openModal);

  const closeModal = () => {
    authModal.classList.remove('active');
    authOverlay.classList.remove('active');
    clearAuthForms();
  };

  modalClose?.addEventListener('click', closeModal);
  authOverlay?.addEventListener('click', closeModal);

  toggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    authState = authState === 'register' ? 'login' : 'register';
    showAuthForm(authState);
  });

  registerForm?.addEventListener('submit', handleRegister);
  loginForm?.addEventListener('submit', handleLogin);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeModal();
    }
  });
}

function showAuthForm(type) {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const toggleText = document.getElementById('toggle-text');
  const modalHeader = document.querySelector('.modal-header h2');
  const modalSubtitle = document.querySelector('.modal-header p');

  if (type === 'register') {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    toggleText.textContent = "Don't have an account? ";
    modalHeader.textContent = 'Join Skyfall';
    modalSubtitle.textContent = 'Create your account to apply for India\'s largest teen hackathon';
  } else {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    toggleText.textContent = 'Already have an account? ';
    modalHeader.textContent = 'Welcome Back';
    modalSubtitle.textContent = 'Sign in to your Skyfall account';
  }

  document.getElementById('toggle-btn').textContent = type === 'register' ? 'Sign In' : 'Sign Up';
}

function clearAuthForms() {
  document.getElementById('register-form').reset();
  document.getElementById('login-form').reset();
  document.getElementById('register-message').innerHTML = '';
  document.getElementById('login-message').innerHTML = '';
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const msgDiv = document.getElementById('register-message');

  if (password !== confirm) {
    showMessage(msgDiv, 'Passwords do not match!', 'error');
    return;
  }

  showMessage(msgDiv, 'Creating your account...', 'loading');

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      showMessage(msgDiv, 'Account created! Welcome to Skyfall! 🎉', 'success');
      setTimeout(() => {
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('auth-overlay').classList.remove('active');
      }, 2000);
    } else {
      showMessage(msgDiv, data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showMessage(msgDiv, 'An error occurred. Please try again.', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msgDiv = document.getElementById('login-message');

  showMessage(msgDiv, 'Signing in...', 'loading');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      showMessage(msgDiv, 'Welcome back! 🚀', 'success');
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => {
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('auth-overlay').classList.remove('active');
      }, 2000);
    } else {
      showMessage(msgDiv, data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showMessage(msgDiv, 'An error occurred. Please try again.', 'error');
  }
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove('show', 'error', 'success', 'loading');
  element.classList.add('show', type);
}

// ==========================================
// PROJECT IDEA GENERATOR
// ==========================================
const PROJECT_IDEAS = [
  { title: "AI-Powered Study Assistant", description: "Build an AI chatbot that helps students understand complex concepts using GPT/Claude API." },
  { title: "Real-time Collaborative Code Editor", description: "Create a web editor where coders can write and test code together with WebSockets." },
  { title: "AI Image Generator Web App", description: "Build a web interface for generating images using DALL-E or Stable Diffusion APIs." },
  { title: "Campus Event Finder App", description: "Create a mobile/web app showing all campus events with filtering and RSVP functionality." },
  { title: "Ambient Noise Generator", description: "Build a web app mixing ambient sounds (rain, coffee shop, forest) for focused work." },
  { title: "Code Snippet Manager", description: "Create an app to save, organize, and share code snippets with syntax highlighting." },
  { title: "AI Resume Builder", description: "Build a tool helping users create professional resumes with AI suggestions." },
  { title: "Real-time Music Visualizer", description: "Create a web app visualizing music in real-time using Web Audio API and Canvas." },
  { title: "Personal Finance Dashboard", description: "Build a tracker for spending, budgets, and financial insights." },
  { title: "AI-Powered Workout Planner", description: "Create an app generating personalized workout plans based on fitness level." },
  { title: "Collaborative Whiteboard App", description: "Build a drawing tool where teams can sketch and design together in real-time." },
  { title: "Smart Recipe Finder", description: "Create an app where users list ingredients and get recipe suggestions from AI." },
  { title: "Coding Challenge Platform", description: "Build a platform where coders solve programming challenges and compete." },
  { title: "AI-Powered Travel Planner", description: "Create an app suggesting personalized travel itineraries based on preferences." },
  { title: "Real-time Chat with E2E Encryption", description: "Build a secure messaging app with end-to-end encryption." },
  { title: "AI Content Summarizer", description: "Build a tool that summarizes long articles, papers, or videos instantly." },
  { title: "Gaming Stats Tracker", description: "Create an app to track gaming stats and compare with friends." },
  { title: "Habit Tracker with AI Insights", description: "Build an app where users track habits and get AI-powered improvement insights." },
  { title: "Multiplayer Drawing Game", description: "Create an online Pictionary-style game where players draw and guess." },
  { title: "AI Meditation Guide App", description: "Build an app with guided meditation, mood tracking, and personalized recommendations." }
];

function initIdeaGenerator() {
  const btnGenerate = document.getElementById('btn-generate-idea');
  const ideaContent = document.getElementById('idea-content');

  if (!btnGenerate) return;

  const generateIdea = () => {
    const idea = PROJECT_IDEAS[Math.floor(Math.random() * PROJECT_IDEAS.length)];
    
    ideaContent.innerHTML = `
      <div>
        <h3 style="margin-bottom: 0.5rem; color: var(--primary);">${idea.title}</h3>
        <p style="color: var(--text-secondary); font-size: 1rem;">${idea.description}</p>
      </div>
    `;
    
    ideaContent.style.animation = 'none';
    setTimeout(() => {
      ideaContent.style.animation = 'fadeIn 0.5s ease-out';
    }, 10);
  };

  btnGenerate.addEventListener('click', generateIdea);
}

// ==========================================
// FAQ ACCORDION
// ==========================================
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header?.addEventListener('click', () => {
      // Close others
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      // Toggle current
      item.classList.toggle('active');
    });
  });
}

// ==========================================
// NEWSLETTER
// ==========================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        form.innerHTML = '<p style="color: var(--primary); font-weight: 600; text-align: center;">✅ Thanks for subscribing!</p>';
      }
    } catch (err) {
      console.error('Newsletter error:', err);
    }
  });
}

// ==========================================
// PARTICLE SYSTEM
// ==========================================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.8s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.project-card, .quest-section').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ==========================================
// INIT ALL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAuthModal();
  initFAQ();
  initNewsletter();
  initParticles();
  initSmoothScroll();
  initScrollAnimations();
  initIdeaGenerator();
});

// Update navbar on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.boxShadow = '0 4px 12px rgba(0, 217, 255, 0.1)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});
