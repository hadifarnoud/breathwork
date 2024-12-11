// app.js

// BREATHING SEQUENCE: [ {action: "Inhale", time:8}, {action:"Hold", time:1.5}, {action:"Exhale", time:4}, {action:"Hold", time:1.5} ]
const sequence = [
  { label: 'Inhale', duration: 8 },
  { label: 'Hold', duration: 1.5 },
  { label: 'Exhale', duration: 4 },
  { label: 'Hold', duration: 1.5 }
];

let currentStep = 0;
let interval = null;
let countdown = sequence[0].duration;
let isRunning = false;

// 5 cycles of the full sequence
const totalCycles = 5;
let currentCycle = 1;

// Tracking data
const STORAGE_KEY = 'breathwork-data';
let breathworkData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

const instructionsEl = document.querySelector('.timer-instructions');
const countdownEl = document.querySelector('.timer-countdown');
const startBtn = document.querySelector('.start-button');
const todayCountEl = document.querySelector('.today-count');
const calendarContainer = document.querySelector('.calendar-container');
const timerCircle = document.getElementById('timerCircle');

// Load beep sound
const beep = new Audio('beep.mp3');
function playBeep() {
  // Reset sound each time before playing to ensure it plays from start
  beep.currentTime = 0;
  beep.play();
}

startBtn.addEventListener('click', startSequence);

function startSequence() {
  if (isRunning) return;
  isRunning = true;
  currentCycle = 1;
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

function logCompletion() {
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  if (!breathworkData[dateKey]) {
    breathworkData[dateKey] = 0;
  }
  breathworkData[dateKey] += totalCycles; 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(breathworkData));
  updateTodayCount();
  renderCalendar();
}

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

updateTodayCount();
renderCalendar();
