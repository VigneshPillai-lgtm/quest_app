// ==========================================
// THE SUMMIT — Landing Page JavaScript
// ==========================================

// ==========================================
// AUTHENTICATION MODAL
// ==========================================

let authState = 'register'; // 'register' or 'login'

function initAuthModal() {
  const registerBtn = document.getElementById('btn-register');
  const navRegisterBtn = document.getElementById('nav-register');
  const modalClose = document.getElementById('modal-close');
  const authModal = document.getElementById('auth-modal');
  const authOverlay = document.getElementById('auth-overlay');
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleText = document.getElementById('toggle-text');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  // Open modal from hero button
  const openModal = (e) => {
    e.preventDefault?.();
    authModal.classList.add('active');
    authOverlay.classList.add('active');
    authState = 'register';
    showAuthForm('register');
  };

  registerBtn?.addEventListener('click', openModal);
  navRegisterBtn?.addEventListener('click', openModal);

  // Close modal
  const closeModal = () => {
    authModal.classList.remove('active');
    authOverlay.classList.remove('active');
    clearAuthForms();
  };

  modalClose?.addEventListener('click', closeModal);
  authOverlay?.addEventListener('click', closeModal);

  // Toggle between register and login
  toggleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (authState === 'register') {
      authState = 'login';
      showAuthForm('login');
    } else {
      authState = 'register';
      showAuthForm('register');
    }
  });

  // Register form submission
  registerForm?.addEventListener('submit', handleRegister);

  // Login form submission
  loginForm?.addEventListener('submit', handleLogin);

  // Close on Escape key
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
    toggleText.innerHTML = 'Already have an account? <button type="button" class="link-btn" style="background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 600; text-decoration: none; padding: 0; font: inherit;">Sign In</button>';
    modalHeader.textContent = 'Join The Summit';
    modalSubtitle.textContent = 'Create your account to apply for the hackathon';
  } else {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    toggleText.innerHTML = 'Don\'t have an account? <button type="button" class="link-btn" style="background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 600; text-decoration: none; padding: 0; font: inherit;">Sign Up</button>';
    modalHeader.textContent = 'Welcome Back';
    modalSubtitle.textContent = 'Sign in to your account';
  }

  // Re-attach toggle button listener
  const newToggleBtn = document.querySelector('.modal-header ~ .auth-toggle .link-btn') || 
                       document.querySelector('.auth-toggle .link-btn');
  if (newToggleBtn) {
    newToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (authState === 'register') {
        authState = 'login';
        showAuthForm('login');
      } else {
        authState = 'register';
        showAuthForm('register');
      }
    });
  }
}

function clearAuthForms() {
  const registers = document.querySelectorAll('#register-form input');
  const logins = document.querySelectorAll('#login-form input');
  const messages = document.querySelectorAll('.form-message');

  registers.forEach(input => input.value = '');
  logins.forEach(input => input.value = '');
  messages.forEach(msg => {
    msg.textContent = '';
    msg.className = 'form-message';
  });
}

async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;
  const message = document.getElementById('register-message');

  // Validation
  if (password !== confirm) {
    showMessage(message, 'Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(message, 'Password must be at least 6 characters', 'error');
    return;
  }

  showMessage(message, 'Creating account...', 'loading');

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(message, '✓ Account created! Redirecting...', 'success');
      localStorage.setItem('user_email', email);
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
    } else {
      showMessage(message, data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Register error:', error);
    showMessage(message, 'Network error. Please try again.', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');

  showMessage(message, 'Signing in...', 'loading');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(message, '✓ Sign in successful! Redirecting...', 'success');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_xp', data.user.xp);
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
    } else {
      showMessage(message, data.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage(message, 'Network error. Please try again.', 'error');
  }
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `form-message ${type}`;
}

function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      // Toggle current item
      item.classList.toggle('active');
    });
  });
}

// Newsletter Form
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('Thanks for subscribing! Check your email for updates.');
        form.reset();
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please try again later.');
    }
  });
}

// Particle Canvas
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 30;

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.1 * (1 - distance / 150)})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Intersection Observer for animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
  });
}

// Mouse move effect for hero section
function initMouseEffect() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;

  document.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return; // Disable on mobile

    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    heroVisual.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
  });

  document.addEventListener('mouseleave', () => {
    heroVisual.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

// ==========================================
// PROJECT IDEA GENERATOR
// ==========================================

const PROJECT_IDEAS = [
  {
    title: "AI-Powered Study Assistant",
    description: "Build an AI chatbot that helps students understand complex concepts using GPT/Claude API and provides personalized study notes."
  },
  {
    title: "Real-time Collaborative Code Editor",
    description: "Create a web editor where multiple coders can write and test code together in real-time with WebSockets."
  },
  {
    title: "AI Image Generator Web App",
    description: "Build a web interface for generating images using DALL-E or Stable Diffusion APIs with history tracking."
  },
  {
    title: "Campus Event Finder App",
    description: "Create a mobile/web app that shows all campus events, with filtering, notifications, and RSVP functionality."
  },
  {
    title: "Ambient Noise Generator",
    description: "Build a web app that lets users mix ambient sounds (rain, coffee shop, forest) for focused work sessions."
  },
  {
    title: "Code Snippet Manager",
    description: "Create an app to save, organize, and share code snippets with syntax highlighting and search."
  },
  {
    title: "AI Resume Builder",
    description: "Build a tool that helps users create professional resumes with AI suggestions for better content."
  },
  {
    title: "Real-time Music Visualizer",
    description: "Create a web app that visualizes music in real-time using Web Audio API and Canvas."
  },
  {
    title: "Personal Finance Dashboard",
    description: "Build a dashboard that tracks spending, creates budgets, and provides insights on financial habits."
  },
  {
    title: "AI-Powered Workout Planner",
    description: "Create an app that generates personalized workout plans based on goals and fitness level using AI."
  },
  {
    title: "Collaborative Whiteboard App",
    description: "Build a drawing/whiteboarding tool where teams can sketch and design together in real-time."
  },
  {
    title: "Smart Recipe Finder",
    description: "Create an app where users list ingredients they have, and get recipe suggestions powered by AI."
  },
  {
    title: "Coding Challenge Platform",
    description: "Build a platform where coders solve programming challenges, track progress, and compete on leaderboards."
  },
  {
    title: "AI-Powered Travel Planner",
    description: "Create an app that suggests personalized travel itineraries based on preferences and budget."
  },
  {
    title: "Real-time Chat with E2E Encryption",
    description: "Build a secure messaging app with end-to-end encryption and read receipts."
  },
  {
    title: "AI Content Summarizer",
    description: "Build a tool that summarizes long articles, papers, or videos into concise summaries."
  },
  {
    title: "Gaming Stats Tracker",
    description: "Create an app to track gaming stats, compare with friends, and analyze game performance."
  },
  {
    title: "Habit Tracker with AI Insights",
    description: "Build an app where users track daily habits and get AI-powered insights on improvement."
  },
  {
    title: "Multiplayer Drawing Game",
    description: "Create an online Pictionary-style game where players draw and guess in real-time."
  },
  {
    title: "AI Meditation Guide App",
    description: "Build an app with guided meditation sessions, mood tracking, and personalized recommendations."
  }
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
    
    // Add animation
    ideaContent.style.animation = 'none';
    setTimeout(() => {
      ideaContent.style.animation = 'slideInUp 0.5s ease-out';
    }, 10);
  };

  btnGenerate.addEventListener('click', generateIdea);
}

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
  initAuthModal();
  initFAQ();
  initNewsletter();
  initParticles();
  initSmoothScroll();
  initScrollAnimations();
  initMouseEffect();
  initIdeaGenerator();
});

// Scroll to top functionality
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.boxShadow = '0 4px 12px rgba(0, 242, 254, 0.1)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});
