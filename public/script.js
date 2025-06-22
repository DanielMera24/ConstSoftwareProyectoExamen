class FootballMatchGenerator {
  constructor() {
    this.teams = [];
    this.matches = [];
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    // Sections
    this.teamCountSection = document.getElementById('team-count-section');
    this.teamNamesSection = document.getElementById('team-names-section');
    this.matchesSection = document.getElementById('matches-section');

    // Inputs and containers
    this.teamCountInput = document.getElementById('team-count');
    this.teamCountError = document.getElementById('team-count-error');
    this.teamInputsContainer = document.getElementById('team-inputs-container');
    this.matchesContainer = document.getElementById('matches-container');

    // Buttons
    this.proceedToTeamsBtn = document.getElementById('proceed-to-teams');
    this.backToCountBtn = document.getElementById('back-to-count');
    this.generateMatchesBtn = document.getElementById('generate-matches');
    this.regenerateMatchesBtn = document.getElementById('regenerate-matches');
    this.startOverBtn = document.getElementById('start-over');
  }

  attachEventListeners() {
    // Team count validation
    this.teamCountInput.addEventListener('input', () =>
      this.validateTeamCount()
    );
    this.teamCountInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.proceedToTeamNames();
      }
    });

    // Navigation buttons
    this.proceedToTeamsBtn.addEventListener('click', () =>
      this.proceedToTeamNames()
    );
    this.backToCountBtn.addEventListener('click', () => this.goBackToCount());
    this.generateMatchesBtn.addEventListener('click', () =>
      this.generateMatches()
    );
    this.regenerateMatchesBtn.addEventListener('click', () =>
      this.generateMatches()
    );
    this.startOverBtn.addEventListener('click', () => this.startOver());
  }

  validateTeamCount() {
    const count = parseInt(this.teamCountInput.value);
    let errorMessage = '';
    let isValid = false;

    if (!this.teamCountInput.value) {
      errorMessage = '';
    } else if (isNaN(count) || count < 1) {
      errorMessage = 'Please enter a valid number greater than 0';
    } else if (count > 30) {
      errorMessage = 'Maximum 30 teams allowed';
    } else if (count % 2 !== 0) {
      errorMessage = 'Number of teams must be even for proper matchups';
    } else if (count < 2) {
      errorMessage = 'Minimum 2 teams required';
    } else {
      isValid = true;
    }

    this.teamCountError.textContent = errorMessage;
    this.teamCountInput.classList.toggle(
      'error',
      !isValid && this.teamCountInput.value
    );
    this.teamCountInput.classList.toggle('valid', isValid);
    this.proceedToTeamsBtn.disabled = !isValid;

    return isValid;
  }

  proceedToTeamNames() {
    if (!this.validateTeamCount()) {
      return;
    }

    const teamCount = parseInt(this.teamCountInput.value);
    this.createTeamInputs(teamCount);
    this.showSection('team-names');
  }

  createTeamInputs(count) {
    this.teamInputsContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
      const inputGroup = document.createElement('div');
      inputGroup.className = 'team-input-group';

      inputGroup.innerHTML = `
                <label for="team-${i}">Team ${i}</label>
                <input type="text" id="team-${i}" maxlength="40" placeholder="Enter team name">
                <div class="error-message" id="team-${i}-error"></div>
            `;

      this.teamInputsContainer.appendChild(inputGroup);

      // Add event listeners for validation
      const input = inputGroup.querySelector('input');
      input.addEventListener('input', () => this.validateTeamName(i));
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.focusNextInput(i, count);
        }
      });
    }

    // Focus first input
    document.getElementById('team-1').focus();
  }

  validateTeamName(index) {
    const input = document.getElementById(`team-${index}`);
    const errorDiv = document.getElementById(`team-${index}-error`);
    const value = input.value.trim();

    let errorMessage = '';
    let isValid = false;

    if (!value) {
      errorMessage =
        value === '' && input.value !== '' ? 'Team name cannot be empty' : '';
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      errorMessage = 'Only letters and spaces allowed';
    } else if (value.length > 40) {
      errorMessage = 'Maximum 40 characters allowed';
    } else {
      // Check for duplicate names
      const otherInputs = document.querySelectorAll(
        'input[id^="team-"]:not(#team-' + index + ')'
      );
      const duplicateFound = Array.from(otherInputs).some(
        (otherInput) =>
          otherInput.value.trim().toLowerCase() === value.toLowerCase()
      );

      if (duplicateFound) {
        errorMessage = 'Team name must be unique';
      } else {
        isValid = true;
      }
    }

    errorDiv.textContent = errorMessage;
    input.classList.toggle('error', !isValid && value);
    input.classList.toggle('valid', isValid);

    this.updateGenerateButton();
    return isValid;
  }

  focusNextInput(currentIndex, totalCount) {
    if (currentIndex < totalCount) {
      document.getElementById(`team-${currentIndex + 1}`).focus();
    }
  }

  updateGenerateButton() {
    const inputs = document.querySelectorAll('input[id^="team-"]');
    const allValid = Array.from(inputs).every((input) => {
      const value = input.value.trim();
      return value && input.classList.contains('valid');
    });

    this.generateMatchesBtn.disabled = !allValid;
  }

  generateMatches() {
    this.collectTeamNames();
    this.createRandomMatches();
    this.displayMatches();
    this.showSection('matches');
  }

  collectTeamNames() {
    this.teams = [];
    const teamCount = parseInt(this.teamCountInput.value);

    // Only collect the exact number of teams we expect
    for (let i = 1; i <= teamCount; i++) {
      const input = document.getElementById(`team-${i}`);
      const teamName = input.value.trim();
      if (teamName) {
        this.teams.push(teamName);
      }
    }
  }

  createRandomMatches() {
    // Make sure we have the correct number of teams
    if (this.teams.length % 2 !== 0) {
      console.error('Invalid number of teams for match generation');
      return;
    }

    // Shuffle teams array using Fisher-Yates algorithm
    const shuffledTeams = [...this.teams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [
        shuffledTeams[j],
        shuffledTeams[i],
      ];
    }

    // Create matches by pairing adjacent teams
    this.matches = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (i + 1 < shuffledTeams.length) {
        this.matches.push({
          team1: shuffledTeams[i],
          team2: shuffledTeams[i + 1],
        });
      }
    }
  }

  displayMatches() {
    this.matchesContainer.innerHTML = '';

    this.matches.forEach((match, index) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';
      matchDiv.style.animationDelay = `${index * 0.1}s`;

      matchDiv.innerHTML = `
                <span class="team">${match.team1}</span>
                <span class="vs">VS</span>
                <span class="team">${match.team2}</span>
            `;

      this.matchesContainer.appendChild(matchDiv);
    });
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach((section) => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
  }

  goBackToCount() {
    this.showSection('team-count');
    this.teamCountInput.focus();
  }

  startOver() {
    // Reset all data
    this.teams = [];
    this.matches = [];

    // Clear inputs
    this.teamCountInput.value = '';
    this.teamInputsContainer.innerHTML = '';
    this.matchesContainer.innerHTML = '';

    // Clear error messages
    this.teamCountError.textContent = '';

    // Reset button states
    this.proceedToTeamsBtn.disabled = true;
    this.generateMatchesBtn.disabled = true;

    // Show first section
    this.showSection('team-count');
    this.teamCountInput.focus();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FootballMatchGenerator();
});
