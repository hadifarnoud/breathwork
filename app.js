// app.js

// Default breathing pattern
let sequence = [
  { label: 'Inhale', duration: 8 },
  { label: 'Hold', duration: 1.5 },
  { label: 'Exhale', duration: 4 },
  { label: 'Hold', duration: 1.5 }
];

// Preset breathing patterns
const breathingPatterns = {
  default: [
    { label: 'Inhale', duration: 8 },
    { label: 'Hold', duration: 1.5 },
    { label: 'Exhale', duration: 4 },
    { label: 'Hold', duration: 1.5 }
  ],
  box: [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 4 },
    { label: 'Exhale', duration: 4 },
    { label: 'Hold', duration: 4 }
  ],
  relaxing: [
    { label: 'Inhale', duration: 4 },
    { label: 'Hold', duration: 7 },
    { label: 'Exhale', duration: 8 },
    { label: 'Hold', duration: 0 }
  ],
  'wim-hof': [
    { label: 'Inhale', duration: 2 },
    { label: 'Hold', duration: 0 },
    { label: 'Exhale', duration: 2 },
    { label: 'Hold', duration: 0 }
  ]
};

let currentStep = 0;
let interval = null;
let countdown = sequence[0].duration;
let isRunning = false;

// Session configuration
let totalCycles = 5;
let currentCycle = 1;

// Audio settings
let audioVolume = 0.5;
let audioMuted = false;

// Tracking data
const STORAGE_KEY = 'breathwork-data';
const SETTINGS_KEY = 'breathwork-settings';
let breathworkData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let userSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
  activePattern: 'default',
  customPatterns: {},
  sessionLength: 5,
  volume: 0.5,
  muted: false,
  darkMode: false
};

// DOM Elements
const instructionsEl = document.querySelector('.timer-instructions');
const countdownEl = document.querySelector('.timer-countdown');
const startBtn = document.querySelector('.start-button');
const todayCountEl = document.querySelector('.today-count');
const calendarContainer = document.querySelector('.calendar-container');
const timerCircle = document.getElementById('timerCircle');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettings');
const presetButtons = document.querySelectorAll('.preset-btn');
const savePatternBtn = document.getElementById('savePattern');
const sessionLengthSelect = document.getElementById('sessionLength');
const volumeControl = document.getElementById('volume');
const muteCheckbox = document.getElementById('muteAudio');
const darkModeToggle = document.getElementById('darkModeToggle');
const helpButton = document.getElementById('helpButton');

// Stats and achievements elements
const streakCountEl = document.getElementById('streakCount');
const totalSessionsEl = document.getElementById('totalSessions');
const totalMinutesEl = document.getElementById('totalMinutes');
const achievementsListEl = document.getElementById('achievementsList');

// Pattern input fields
const inhaleTimeInput = document.getElementById('inhaleTime');
const inhaleHoldTimeInput = document.getElementById('inhaleHoldTime');
const exhaleTimeInput = document.getElementById('exhaleTime');
const exhaleHoldTimeInput = document.getElementById('exhaleHoldTime');

// Load beep sound with better error handling
let beep = null;

// Add audio context to handle browser restrictions
let audioContext = null;

// Initialize audio context
function initAudioContext() {
  try {
    // Check if AudioContext is supported
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    }
  } catch (e) {
    console.error('Web Audio API not supported in this browser', e);
  }
}

// Resume audio context on user interaction
function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('AudioContext resumed successfully');
    }).catch(error => {
      console.error('Failed to resume AudioContext:', error);
    });
  }
}

// Create a dummy short sound to unlock audio on iOS
function unlockAudio() {
  if (!beep) return;
  
  // Create short silent sound
  const silentSound = new Audio("data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
  
  // Play and immediately stop the sound
  silentSound.play().then(() => {
    silentSound.pause();
    silentSound.currentTime = 0;
    console.log('Audio unlocked successfully');
  }).catch(error => {
    console.error('Failed to unlock audio:', error);
  });
  
  // Also try to play the actual beep sound
  try {
    beep.volume = 0.01; // Very low volume
    beep.play().then(() => {
      beep.pause();
      beep.currentTime = 0;
    }).catch(e => console.error('Beep unlock failed:', e));
  } catch (e) {
    console.error('Error in beep unlock:', e);
  }
}

// Initialize audio on page load
initAudioContext();

// Add handlers to unlock audio on first user interaction
document.addEventListener('click', function unlockOnFirstClick() {
  unlockAudio();
  resumeAudioContext();
  // Remove the event listener after first click
  document.removeEventListener('click', unlockOnFirstClick);
}, { once: true });

// Also try to unlock audio when start button is clicked
startBtn.addEventListener('click', function() {
  unlockAudio();
  resumeAudioContext();
}, { once: true });

// Preload the audio file
function loadAudio() {
  try {
    beep = new Audio('beep.mp3');
    
    // Add event listeners for debugging
    beep.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });
    
    // Force preload
    beep.load();
  } catch (error) {
    console.error('Error creating audio element:', error);
  }
}

// Call this function when the page loads
loadAudio();

// Function to play the beep with better error handling
function playBeep() {
  if (audioMuted || !beep) return;
  
  try {
    // Reset sound each time before playing to ensure it plays from start
    beep.currentTime = 0;
    beep.volume = audioVolume;
    
    // Create a user interaction flag for Safari
    const playPromise = beep.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error playing audio:', error);
        
        // Try to recreate the audio object if playback failed
        if (error.name === 'NotAllowedError') {
          console.log('Audio playback was not allowed. This might require user interaction first.');
        } else {
          // For other errors, try recreating the audio object
          loadAudio();
        }
      });
    }
  } catch (error) {
    console.error('Error in playBeep function:', error);
  }
}

// Initialize settings from saved data
function initializeSettings() {
  // Set up session length
  sessionLengthSelect.value = userSettings.sessionLength;
  totalCycles = parseInt(userSettings.sessionLength);
  
  // Set up audio controls
  volumeControl.value = userSettings.volume;
  audioVolume = userSettings.volume;
  muteCheckbox.checked = userSettings.muted;
  audioMuted = userSettings.muted;
  
  // Set up active pattern
  sequence = [...breathingPatterns[userSettings.activePattern]];
  document.querySelector(`.preset-btn[data-preset="${userSettings.activePattern}"]`)?.classList.add('active');
  
  // Set up pattern input fields
  updatePatternInputs();

  // Set up dark mode
  if (userSettings.darkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  // Check if this is the first time running the app and show tutorial
  if (window.breathworkTutorial.shouldShowTutorial()) {
    // Show tutorial with a slight delay to allow the app to render
    setTimeout(() => {
      window.breathworkTutorial.showTutorial();
    }, 1000);
  }
}

// Update pattern input fields based on current sequence
function updatePatternInputs() {
  inhaleTimeInput.value = sequence[0].duration;
  inhaleHoldTimeInput.value = sequence[1].duration;
  exhaleTimeInput.value = sequence[2].duration;
  exhaleHoldTimeInput.value = sequence[3].duration;
}

// Settings panel toggle
settingsToggle.addEventListener('click', () => {
  settingsPanel.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('active');
});

// Pattern preset selection
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const presetName = btn.dataset.preset;
    
    // Remove active class from all buttons
    presetButtons.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    btn.classList.add('active');
    
    // Update sequence to use selected preset
    sequence = [...breathingPatterns[presetName]];
    userSettings.activePattern = presetName;
    
    // Update input fields
    updatePatternInputs();
    
    // Save settings
    saveSettings();
  });
});

// Save custom breathing pattern
savePatternBtn.addEventListener('click', () => {
  // Get values from inputs
  const inhaleTime = parseFloat(inhaleTimeInput.value);
  const inhaleHoldTime = parseFloat(inhaleHoldTimeInput.value);
  const exhaleTime = parseFloat(exhaleTimeInput.value);
  const exhaleHoldTime = parseFloat(exhaleHoldTimeInput.value);
  
  // Validate inputs
  if (inhaleTime <= 0 || exhaleTime <= 0 || inhaleHoldTime < 0 || exhaleHoldTime < 0) {
    alert('Please enter valid durations. Inhale and Exhale must be greater than 0.');
    return;
  }
  
  // Update sequence
  sequence = [
    { label: 'Inhale', duration: inhaleTime },
    { label: 'Hold', duration: inhaleHoldTime },
    { label: 'Exhale', duration: exhaleTime },
    { label: 'Hold', duration: exhaleHoldTime }
  ];
  
  // Update presets - deselect all presets since this is custom
  presetButtons.forEach(btn => btn.classList.remove('active'));
  userSettings.activePattern = 'custom';
  
  // Store custom pattern
  breathingPatterns.custom = [...sequence];
  userSettings.customPatterns.custom = [...sequence];
  
  // Save settings
  saveSettings();
  
  // Provide feedback
  alert('Custom pattern saved!');
});

// Session length change
sessionLengthSelect.addEventListener('change', () => {
  totalCycles = parseInt(sessionLengthSelect.value);
  userSettings.sessionLength = totalCycles;
  saveSettings();
});

// Audio settings
volumeControl.addEventListener('input', () => {
  audioVolume = parseFloat(volumeControl.value);
  userSettings.volume = audioVolume;
  saveSettings();
});

muteCheckbox.addEventListener('change', () => {
  audioMuted = muteCheckbox.checked;
  userSettings.muted = audioMuted;
  saveSettings();
});

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
    userSettings.darkMode = true;
  } else {
    document.body.classList.remove('dark-mode');
    userSettings.darkMode = false;
  }
  saveSettings();
});

// Save settings to localStorage
function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings));
}

// Add stop button after the start button in the HTML
function createStopButton() {
  const stopBtn = document.createElement('button');
  stopBtn.className = 'stop-button';
  stopBtn.textContent = 'Stop';
  stopBtn.style.display = 'none'; // Initially hidden
  
  // Insert after start button
  startBtn.parentNode.insertBefore(stopBtn, startBtn.nextSibling);
  
  // Add event listener
  stopBtn.addEventListener('click', stopSequence);
  
  return stopBtn;
}

// Create the stop button
const stopBtn = createStopButton();

// Function to stop the breathing sequence
function stopSequence() {
  if (!isRunning) return;
  
  // Clear the current interval
  clearInterval(interval);
  isRunning = false;
  
  // Show start button, hide stop button
  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  
  // Reset UI
  currentStep = 0;
  updateStep(currentStep);
  displayCountdown(sequence[0].duration);
  
  // Log a partial completion (just the cycles done so far)
  const cyclesDone = currentCycle - 1;
  if (cyclesDone > 0) {
    logPartialCompletion(cyclesDone);
  }
}

// Modify startSequence function to show stop button
function startSequence() {
  if (isRunning) return;
  isRunning = true;
  currentCycle = 1;
  
  // Hide start button, show stop button
  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';
  
  // Close settings panel if open
  settingsPanel.classList.remove('active');
  
  startCycle();
}

function startCycle() {
  currentStep = 0;
  countdown = sequence[0].duration;
  updateStep(currentStep);
  displayCountdown(countdown);
  runTimer();
}

function runTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    countdown = parseFloat((countdown - 0.1).toFixed(1));

    if (countdown <= 0.05) {
      currentStep++;
      if (currentStep < sequence.length) {
        countdown = sequence[currentStep].duration;
        updateStep(currentStep);
        displayCountdown(countdown);
      } else {
        clearInterval(interval);
        handleCycleCompletion();
      }
    } else {
      displayCountdown(countdown);
    }
  }, 100);
}

function handleCycleCompletion() {
  if (currentCycle < totalCycles) {
    currentCycle++;
    startCycle();
  } else {
    isRunning = false;
    logCompletion();
  }
}

// Add function to log partial completion
function logPartialCompletion(cyclesDone) {
  // Log daily data
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  if (!breathworkData[dateKey]) {
    breathworkData[dateKey] = 0;
  }
  breathworkData[dateKey] += cyclesDone; 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(breathworkData));
  
  // Calculate exact minutes more precisely
  // Get cycle duration in seconds
  const cycleDurationSecs = sequence.reduce((sum, step) => sum + step.duration, 0);
  // Convert to minutes with precision
  const exactMinutes = (cycleDurationSecs * cyclesDone) / 60;
  
  // Update the streak and achievement data
  const newStreakData = window.breathworkAchievements.updateStreakWithExactMinutes(cyclesDone, exactMinutes);
  
  // Show achievements earned
  const newAchievements = window.breathworkAchievements.getAllAchievementsWithStatus()
    .filter(a => a.earned && !shownAchievements.includes(a.id));
  
  // Show any new achievements
  newAchievements.forEach(achievement => {
    window.breathworkAchievements.showAchievementNotification(achievement);
    shownAchievements.push(achievement.id);
  });
  
  // Update UI
  updateTodayCount();
  renderCalendar();
  updateStreakDisplay();
  renderAchievements();
}

// Modify the logCompletion function to use more precise timing
function logCompletion() {
  // Log daily data
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  if (!breathworkData[dateKey]) {
    breathworkData[dateKey] = 0;
  }
  breathworkData[dateKey] += totalCycles; 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(breathworkData));
  
  // Calculate exact minutes more precisely
  // Get cycle duration in seconds
  const cycleDurationSecs = sequence.reduce((sum, step) => sum + step.duration, 0);
  // Convert to minutes with precision
  const exactMinutes = (cycleDurationSecs * totalCycles) / 60;
  
  // Update the streak and achievement data with exact minutes
  const newStreakData = window.breathworkAchievements.updateStreakWithExactMinutes(totalCycles, exactMinutes);
  
  // Show achievements earned
  const newAchievements = window.breathworkAchievements.getAllAchievementsWithStatus()
    .filter(a => a.earned && !shownAchievements.includes(a.id));
  
  // Show any new achievements
  newAchievements.forEach(achievement => {
    window.breathworkAchievements.showAchievementNotification(achievement);
    shownAchievements.push(achievement.id);
  });
  
  // Reset UI
  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  
  // Update UI
  updateTodayCount();
  renderCalendar();
  updateStreakDisplay();
  renderAchievements();
}

// Track shown achievements during this session
const shownAchievements = [];

function updateTodayCount() {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  todayCountEl.textContent = breathworkData[dateKey] || 0;
}

function renderCalendar() {
  calendarContainer.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month+1, 0);

  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  for (let i = 0; i < startDay; i++) {
    const blankDay = document.createElement('div');
    blankDay.className = 'calendar-day';
    calendarContainer.appendChild(blankDay);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = new Date(year, month, d).toISOString().split('T')[0];
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = d;
    if (breathworkData[dayKey]) {
      dayEl.classList.add('has-data');
      dayEl.setAttribute('data-count', breathworkData[dayKey]);
    }
    calendarContainer.appendChild(dayEl);
  }
}

function displayCountdown(time) {
  countdownEl.textContent = time % 1 === 0 ? time.toFixed(0) : time.toFixed(1);
}

function updateStep(stepIndex) {
  const step = sequence[stepIndex];
  instructionsEl.textContent = step.label;

  // Remove old step classes
  timerCircle.classList.remove('inhale', 'hold', 'exhale');

  // Add new step class based on label
  if (step.label.toLowerCase() === 'inhale') {
    timerCircle.classList.add('inhale');
  } else if (step.label.toLowerCase() === 'exhale') {
    timerCircle.classList.add('exhale');
  } else if (step.label.toLowerCase() === 'hold') {
    timerCircle.classList.add('hold');
  }

  // Play beep sound on step change
  playBeep();
}

// Update streak and stats display
function updateStreakDisplay() {
  const streakData = window.breathworkAchievements.loadStreakData();
  
  streakCountEl.textContent = streakData.currentStreak;
  totalSessionsEl.textContent = streakData.totalSessions;
  
  // Display minutes with one decimal place for better accuracy
  const minutesValue = streakData.totalMinutes;
  totalMinutesEl.textContent = minutesValue.toFixed(1);
}

// Render achievements list
function renderAchievements() {
  const achievements = window.breathworkAchievements.getAllAchievementsWithStatus();
  achievementsListEl.innerHTML = '';
  
  achievements.forEach(achievement => {
    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement-item ${achievement.earned ? 'earned' : 'locked'}`;
    
    achievementEl.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <h3>${achievement.title}</h3>
      <p>${achievement.description}</p>
    `;
    
    achievementsListEl.appendChild(achievementEl);
  });
}

// Initialize the app
initializeSettings();
updateTodayCount();
renderCalendar();
updateStreakDisplay();
renderAchievements();

// Then add an event listener for the help button after the other event listeners
helpButton.addEventListener('click', () => {
  window.breathworkTutorial.showTutorial();
});

// Start breathing sequence
startBtn.addEventListener('click', startSequence);
