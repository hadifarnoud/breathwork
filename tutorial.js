// tutorial.js - Handles the first-time user tutorial

const TUTORIAL_KEY = 'breathwork-tutorial-shown';

// Tutorial steps content
const tutorialSteps = [
  {
    title: "Welcome to Breathwork",
    description: "This app helps you practice guided breathing exercises to improve your wellness and reduce stress. Let's get started with a quick tour!",
    image: null
  },
  {
    title: "Breathing Timer",
    description: "The timer guides you through each phase of the breathing cycle. Follow the instructions and the countdown timer to maintain a steady rhythm.",
    image: null
  },
  {
    title: "Customize Your Experience",
    description: "Choose from preset breathing patterns or create your own custom pattern. You can also adjust the session length to fit your schedule.",
    image: null
  },
  {
    title: "Track Your Progress",
    description: "Monitor your daily practice, build streaks, and earn achievements as you develop a consistent breathing practice.",
    image: null
  },
  {
    title: "You're Ready!",
    description: "Press Start to begin your first breathing session. Remember, consistency is key to experiencing the benefits of breathwork.",
    image: null
  }
];

// Check if tutorial has been shown before
function shouldShowTutorial() {
  return !localStorage.getItem(TUTORIAL_KEY);
}

// Mark tutorial as shown
function markTutorialAsShown() {
  localStorage.setItem(TUTORIAL_KEY, 'true');
}

// Create tutorial DOM elements
function createTutorialOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  
  const content = document.createElement('div');
  content.className = 'tutorial-content';
  
  // Create header with title and close button
  const header = document.createElement('div');
  header.className = 'tutorial-header';
  
  const title = document.createElement('h2');
  title.id = 'tutorial-title';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'tutorial-close';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    closeTutorial();
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Create content area for steps
  const stepsContainer = document.createElement('div');
  stepsContainer.className = 'tutorial-steps';
  
  tutorialSteps.forEach((step, index) => {
    const stepEl = document.createElement('div');
    stepEl.className = `tutorial-step ${index === 0 ? 'active' : ''}`;
    stepEl.setAttribute('data-step', index);
    
    if (step.image) {
      const img = document.createElement('img');
      img.src = step.image;
      img.alt = step.title;
      img.className = 'tutorial-image';
      stepEl.appendChild(img);
    }
    
    const description = document.createElement('p');
    description.className = 'tutorial-description';
    description.textContent = step.description;
    
    stepEl.appendChild(description);
    stepsContainer.appendChild(stepEl);
  });
  
  // Create navigation controls
  const nav = document.createElement('div');
  nav.className = 'tutorial-nav';
  
  const dots = document.createElement('div');
  dots.className = 'tutorial-dots';
  
  tutorialSteps.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `tutorial-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('data-step', index);
    dots.appendChild(dot);
  });
  
  const buttonContainer = document.createElement('div');
  const prevButton = document.createElement('button');
  prevButton.className = 'tutorial-button tutorial-prev disabled';
  prevButton.textContent = 'Back';
  prevButton.disabled = true;
  
  const nextButton = document.createElement('button');
  nextButton.className = 'tutorial-button tutorial-next';
  nextButton.textContent = 'Next';
  
  buttonContainer.appendChild(prevButton);
  buttonContainer.appendChild(nextButton);
  
  nav.appendChild(dots);
  nav.appendChild(buttonContainer);
  
  // Assemble the overlay
  content.appendChild(header);
  content.appendChild(stepsContainer);
  content.appendChild(nav);
  overlay.appendChild(content);
  
  // Add event listeners
  prevButton.addEventListener('click', () => {
    navigateStep('prev');
  });
  
  nextButton.addEventListener('click', () => {
    navigateStep('next');
  });
  
  return overlay;
}

// Show tutorial
function showTutorial() {
  // Create and add overlay to body if it doesn't exist
  if (!document.querySelector('.tutorial-overlay')) {
    const overlay = createTutorialOverlay();
    document.body.appendChild(overlay);
  }
  
  const overlay = document.querySelector('.tutorial-overlay');
  const title = document.getElementById('tutorial-title');
  
  // Set initial step title
  title.textContent = tutorialSteps[0].title;
  
  // Show overlay with animation
  setTimeout(() => {
    overlay.classList.add('active');
  }, 100);
  
  // Mark as shown
  markTutorialAsShown();
}

// Close tutorial
function closeTutorial() {
  const overlay = document.querySelector('.tutorial-overlay');
  overlay.classList.remove('active');
  
  // Remove from DOM after transition
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 300);
}

// Navigate between tutorial steps
function navigateStep(direction) {
  const currentStep = document.querySelector('.tutorial-step.active');
  const currentIndex = parseInt(currentStep.getAttribute('data-step'));
  
  let newIndex;
  
  if (direction === 'next') {
    newIndex = currentIndex + 1;
    if (newIndex >= tutorialSteps.length) {
      closeTutorial();
      return;
    }
  } else {
    newIndex = currentIndex - 1;
    if (newIndex < 0) return;
  }
  
  // Update step visibility
  document.querySelectorAll('.tutorial-step').forEach(step => {
    step.classList.remove('active');
  });
  
  document.querySelector(`.tutorial-step[data-step="${newIndex}"]`).classList.add('active');
  
  // Update dots
  document.querySelectorAll('.tutorial-dot').forEach(dot => {
    dot.classList.remove('active');
  });
  
  document.querySelector(`.tutorial-dot[data-step="${newIndex}"]`).classList.add('active');
  
  // Update title
  document.getElementById('tutorial-title').textContent = tutorialSteps[newIndex].title;
  
  // Update buttons
  const prevButton = document.querySelector('.tutorial-prev');
  const nextButton = document.querySelector('.tutorial-next');
  
  if (newIndex === 0) {
    prevButton.classList.add('disabled');
    prevButton.disabled = true;
  } else {
    prevButton.classList.remove('disabled');
    prevButton.disabled = false;
  }
  
  if (newIndex === tutorialSteps.length - 1) {
    nextButton.textContent = 'Finish';
  } else {
    nextButton.textContent = 'Next';
  }
}

// Export functions
window.breathworkTutorial = {
  shouldShowTutorial,
  showTutorial,
  closeTutorial
}; 