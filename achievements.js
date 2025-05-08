// achievements.js - Handles achievements and streaks tracking

const STREAK_KEY = 'breathwork-streaks';
const ACHIEVEMENTS_KEY = 'breathwork-achievements';

// Achievement definitions
const achievementsList = {
  firstSession: {
    id: 'firstSession',
    title: 'First Breath',
    description: 'Complete your first breathing session',
    icon: '🌱',
    condition: (stats) => stats.totalSessions >= 1
  },
  oneWeekStreak: {
    id: 'oneWeekStreak',
    title: 'Consistent Breather',
    description: 'Complete breathing sessions for 7 consecutive days',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 7
  },
  tenSessions: {
    id: 'tenSessions',
    title: 'Dedicated Practitioner',
    description: 'Complete 10 breathing sessions',
    icon: '🧘',
    condition: (stats) => stats.totalSessions >= 10
  },
  twentyFiveSessions: {
    id: 'twentyFiveSessions',
    title: 'Breath Master',
    description: 'Complete 25 breathing sessions',
    icon: '🏆',
    condition: (stats) => stats.totalSessions >= 25
  },
  oneHundredSessions: {
    id: 'oneHundredSessions',
    title: 'Breath Guru',
    description: 'Complete 100 breathing sessions',
    icon: '👑',
    condition: (stats) => stats.totalSessions >= 100
  },
  twoWeekStreak: {
    id: 'twoWeekStreak',
    title: 'Breath Warrior',
    description: 'Complete breathing sessions for 14 consecutive days',
    icon: '⚔️',
    condition: (stats) => stats.currentStreak >= 14
  },
  oneMonthStreak: {
    id: 'oneMonthStreak',
    title: 'Breath Sage',
    description: 'Complete breathing sessions for 30 consecutive days',
    icon: '🌟',
    condition: (stats) => stats.currentStreak >= 30
  }
};

// Load user streak data
function loadStreakData() {
  const streakData = JSON.parse(localStorage.getItem(STREAK_KEY)) || {
    currentStreak: 0,
    lastSessionDate: null,
    totalSessions: 0,
    totalMinutes: 0
  };
  return streakData;
}

// Load user achievements
function loadAchievements() {
  return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY)) || [];
}

// Update streak when a session is completed
function updateStreak(cyclesCompleted, patternDuration) {
  const streakData = loadStreakData();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Calculate session duration in minutes
  const cycleDuration = patternDuration.reduce((sum, step) => sum + step.duration, 0);
  const sessionMinutes = (cycleDuration * cyclesCompleted) / 60;
  
  // Update total stats
  streakData.totalSessions += 1;
  streakData.totalMinutes += sessionMinutes;
  
  if (!streakData.lastSessionDate) {
    // First ever session
    streakData.currentStreak = 1;
  } else {
    const lastSessionDate = new Date(streakData.lastSessionDate);
    const daysBetween = getDaysBetween(lastSessionDate, today);
    
    if (daysBetween === 0 && todayStr === streakData.lastSessionDate) {
      // Same day, streak unchanged
    } else if (daysBetween === 1) {
      // Consecutive day, streak continues
      streakData.currentStreak += 1;
    } else if (daysBetween > 1) {
      // Streak broken
      streakData.currentStreak = 1;
    }
  }
  
  streakData.lastSessionDate = todayStr;
  
  // Save updated streak data
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  
  // Check for achievements
  checkAchievements(streakData);
  
  return streakData;
}

// Calculate days between two dates
function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Check if user has earned any new achievements
function checkAchievements(stats) {
  const userAchievements = loadAchievements();
  let newAchievements = [];
  
  // Check each achievement
  for (const achievementId in achievementsList) {
    const achievement = achievementsList[achievementId];
    
    // Skip already earned achievements
    if (userAchievements.includes(achievementId)) continue;
    
    // Check if condition is met
    if (achievement.condition(stats)) {
      userAchievements.push(achievementId);
      newAchievements.push(achievement);
    }
  }
  
  // Save updated achievements
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(userAchievements));
  
  // Return new achievements for notifications
  return newAchievements;
}

// Display achievement notification
function showAchievementNotification(achievement) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <h3>${achievement.title}</h3>
      <p>${achievement.description}</p>
    </div>
    <button class="close-notification">×</button>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Add close handler
  notification.querySelector('.close-notification').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Get all achievements with their earned status
function getAllAchievementsWithStatus() {
  const userAchievements = loadAchievements();
  const result = [];
  
  for (const achievementId in achievementsList) {
    const achievement = achievementsList[achievementId];
    result.push({
      ...achievement,
      earned: userAchievements.includes(achievementId)
    });
  }
  
  return result;
}

// Update streak with exact minutes calculation
function updateStreakWithExactMinutes(cyclesCompleted, exactMinutes) {
  const streakData = loadStreakData();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Update total stats with precise minutes
  streakData.totalSessions += 1;
  streakData.totalMinutes += exactMinutes;
  
  if (!streakData.lastSessionDate) {
    // First ever session
    streakData.currentStreak = 1;
  } else {
    const lastSessionDate = new Date(streakData.lastSessionDate);
    const daysBetween = getDaysBetween(lastSessionDate, today);
    
    if (daysBetween === 0 && todayStr === streakData.lastSessionDate) {
      // Same day, streak unchanged
    } else if (daysBetween === 1) {
      // Consecutive day, streak continues
      streakData.currentStreak += 1;
    } else if (daysBetween > 1) {
      // Streak broken
      streakData.currentStreak = 1;
    }
  }
  
  streakData.lastSessionDate = todayStr;
  
  // Save updated streak data
  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  
  // Check for achievements
  checkAchievements(streakData);
  
  return streakData;
}

// Export functions
window.breathworkAchievements = {
  updateStreak,
  updateStreakWithExactMinutes,
  loadStreakData,
  showAchievementNotification,
  getAllAchievementsWithStatus
}; 