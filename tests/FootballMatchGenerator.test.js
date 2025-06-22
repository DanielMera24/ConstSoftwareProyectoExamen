// tests/FootballMatchGenerator.test.js

import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

// Setup del DOM usando JSDOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="team-count-section">
        <input id="team-count" type="number">
        <div id="team-count-error"></div>
        <button id="proceed-to-teams"></button>
      </div>
      <div id="team-names-section">
        <div id="team-inputs-container"></div>
        <button id="generate-matches"></button>
        <button id="back-to-count"></button>
      </div>
      <div id="matches-section">
        <div id="matches-container"></div>
        <button id="regenerate-matches"></button>
        <button id="start-over"></button>
      </div>
    </body>
  </html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Mock console.error
const originalConsoleError = console.error;
console.error = mock.fn();

// Clase FootballMatchGenerator (versión simplificada para testing)
class FootballMatchGenerator {
  constructor() {
    this.teams = [];
    this.matches = [];
    this.initializeElements();
  }

  initializeElements() {
    this.teamCountInput = document.getElementById('team-count');
    this.teamCountError = document.getElementById('team-count-error');
    this.proceedToTeamsBtn = document.getElementById('proceed-to-teams');
    this.generateMatchesBtn = document.getElementById('generate-matches');
    this.teamInputsContainer = document.getElementById('team-inputs-container');
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
    return isValid;
  }

  validateTeamName(name) {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Team name cannot be empty' };
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return { isValid: false, error: 'Only letters and spaces allowed' };
    }
    if (name.trim().length > 40) {
      return { isValid: false, error: 'Maximum 40 characters allowed' };
    }
    return { isValid: true, error: '' };
  }

  createRandomMatches() {
    if (this.teams.length % 2 !== 0) {
      console.error('Invalid number of teams for match generation');
      return;
    }

    const shuffledTeams = [...this.teams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTeams[i], shuffledTeams[j]] = [
        shuffledTeams[j],
        shuffledTeams[i],
      ];
    }

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

  collectTeamNames() {
    this.teams = [];
    const teamCount = parseInt(this.teamCountInput.value);

    for (let i = 1; i <= teamCount; i++) {
      const input = document.getElementById(`team-${i}`);
      if (input) {
        const teamName = input.value.trim();
        if (teamName) {
          this.teams.push(teamName);
        }
      }
    }
  }

  createTeamInputs(count) {
    this.teamInputsContainer.innerHTML = '';

    for (let i = 1; i <= count; i++) {
      const inputGroup = document.createElement('div');
      inputGroup.innerHTML = `
        <input type="text" id="team-${i}" maxlength="40" value="">
      `;
      this.teamInputsContainer.appendChild(inputGroup);
    }
  }
}

describe('FootballMatchGenerator', () => {
  let generator;

  beforeEach(() => {
    // Reset console.error mock
    console.error.mock.resetCalls();

    // Create new generator instance
    generator = new FootballMatchGenerator();

    // Reset DOM elements
    generator.teamCountInput.value = '';
    generator.teamCountError.textContent = '';
    generator.teamInputsContainer.innerHTML = '';
    generator.teams = [];
    generator.matches = [];
  });

  describe('validateTeamCount', () => {
    test('should validate even numbers between 2 and 30', () => {
      // Caso válido: 4 equipos
      generator.teamCountInput.value = '4';
      assert.strictEqual(generator.validateTeamCount(), true);
      assert.strictEqual(generator.teamCountError.textContent, '');

      // Caso válido: 2 equipos (mínimo)
      generator.teamCountInput.value = '2';
      assert.strictEqual(generator.validateTeamCount(), true);

      // Caso válido: 30 equipos (máximo)
      generator.teamCountInput.value = '30';
      assert.strictEqual(generator.validateTeamCount(), true);
    });

    test('should reject odd numbers', () => {
      generator.teamCountInput.value = '3';
      assert.strictEqual(generator.validateTeamCount(), false);
      assert.strictEqual(
        generator.teamCountError.textContent,
        'Number of teams must be even for proper matchups'
      );
    });

    test('should reject numbers greater than 30', () => {
      generator.teamCountInput.value = '32';
      assert.strictEqual(generator.validateTeamCount(), false);
      assert.strictEqual(
        generator.teamCountError.textContent,
        'Maximum 30 teams allowed'
      );
    });

    test('should reject zero', () => {
      generator.teamCountInput.value = '0';
      assert.strictEqual(generator.validateTeamCount(), false);
      assert.strictEqual(
        generator.teamCountError.textContent,
        'Please enter a valid number greater than 0'
      );
    });

    test('should reject number 1 as odd', () => {
      generator.teamCountInput.value = '1';
      assert.strictEqual(generator.validateTeamCount(), false);
      assert.strictEqual(
        generator.teamCountError.textContent,
        'Number of teams must be even for proper matchups'
      );
    });
  });

  describe('validateTeamName', () => {
    test('should validate correct team names', () => {
      const result1 = generator.validateTeamName('Real Madrid');
      assert.strictEqual(result1.isValid, true);
      assert.strictEqual(result1.error, '');

      const result2 = generator.validateTeamName('Barcelona FC');
      assert.strictEqual(result2.isValid, true);
      assert.strictEqual(result2.error, '');
    });

    test('should reject invalid team names', () => {
      // Nombre vacío
      const result1 = generator.validateTeamName('');
      assert.strictEqual(result1.isValid, false);
      assert.strictEqual(result1.error, 'Team name cannot be empty');

      // Nombre con números/caracteres especiales
      const result2 = generator.validateTeamName('Team123');
      assert.strictEqual(result2.isValid, false);
      assert.strictEqual(result2.error, 'Only letters and spaces allowed');

      // Nombre muy largo (más de 40 caracteres)
      const longName = 'A'.repeat(41);
      const result3 = generator.validateTeamName(longName);
      assert.strictEqual(result3.isValid, false);
      assert.strictEqual(result3.error, 'Maximum 40 characters allowed');
    });
  });

  describe('createRandomMatches', () => {
    test('should create correct number of matches for even teams', () => {
      generator.teams = ['Team A', 'Team B', 'Team C', 'Team D'];
      generator.createRandomMatches();

      assert.strictEqual(generator.matches.length, 2);
      assert.ok(
        Object.prototype.hasOwnProperty.call(generator.matches[0], 'team1')
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(generator.matches[0], 'team2')
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(generator.matches[1], 'team1')
      );
      assert.ok(
        Object.prototype.hasOwnProperty.call(generator.matches[1], 'team2')
      );
    });

    test('should handle odd number of teams gracefully', () => {
      generator.teams = ['Team A', 'Team B', 'Team C'];
      generator.createRandomMatches();

      assert.strictEqual(console.error.mock.callCount(), 1);
      assert.strictEqual(
        console.error.mock.calls[0].arguments[0],
        'Invalid number of teams for match generation'
      );
    });

    test('should ensure all teams are included in matches', () => {
      const teams = ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester United'];
      generator.teams = teams;
      generator.createRandomMatches();

      const allTeamsInMatches = generator.matches.flatMap((match) => [
        match.team1,
        match.team2,
      ]);
      teams.forEach((team) => {
        assert.ok(allTeamsInMatches.includes(team));
      });
    });
  });

  describe('collectTeamNames', () => {
    test('should collect team names from inputs correctly', () => {
      // Setup team inputs in DOM
      generator.teamCountInput.value = '4';
      generator.createTeamInputs(4);

      // Set values for team inputs
      document.getElementById('team-1').value = ' Arsenal ';
      document.getElementById('team-2').value = 'Chelsea';
      document.getElementById('team-3').value = '  '; // Espacio vacío
      document.getElementById('team-4').value = 'Liverpool';

      generator.collectTeamNames();

      assert.deepStrictEqual(generator.teams, [
        'Arsenal',
        'Chelsea',
        'Liverpool',
      ]);
      assert.strictEqual(generator.teams.length, 3); // Solo 3 equipos válidos
    });
  });
});

// Cleanup
process.on('exit', () => {
  console.error = originalConsoleError;
});
