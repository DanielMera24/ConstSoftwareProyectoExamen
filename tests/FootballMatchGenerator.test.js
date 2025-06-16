import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import './setup.js';

// Import the class by loading the script content
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and evaluate the script content
const scriptContent = readFileSync(join(__dirname, '../public/script.js'), 'utf8');
// Remove the DOMContentLoaded event listener for testing
const testableScript = scriptContent.replace(/document\.addEventListener\('DOMContentLoaded'.*?\}\);/s, '');
eval(testableScript);

describe('FootballMatchGenerator - Unit Tests', () => {
    let generator;

    beforeEach(() => {
        // Reset DOM state
        document.getElementById('team-count').value = '';
        document.getElementById('team-count-error').textContent = '';
        document.getElementById('team-inputs-container').innerHTML = '';
        document.getElementById('matches-container').innerHTML = '';
        
        // Create new instance
        generator = new FootballMatchGenerator();
    });

    describe('Team Count Validation', () => {
        it('should accept valid even numbers between 2 and 30', () => {
            const validCounts = [2, 4, 6, 8, 10, 20, 30];
            
            validCounts.forEach(count => {
                document.getElementById('team-count').value = count.toString();
                const isValid = generator.validateTeamCount();
                assert.strictEqual(isValid, true, `Count ${count} should be valid`);
                assert.strictEqual(document.getElementById('team-count-error').textContent, '');
            });
        });

        it('should reject odd numbers', () => {
            const oddCounts = [1, 3, 5, 7, 9, 11];
            
            oddCounts.forEach(count => {
                document.getElementById('team-count').value = count.toString();
                const isValid = generator.validateTeamCount();
                assert.strictEqual(isValid, false, `Count ${count} should be invalid`);
                assert.strictEqual(
                    document.getElementById('team-count-error').textContent,
                    'Number of teams must be even for proper matchups'
                );
            });
        });

        it('should reject numbers greater than 30', () => {
            document.getElementById('team-count').value = '32';
            const isValid = generator.validateTeamCount();
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-count-error').textContent,
                'Maximum 30 teams allowed'
            );
        });

        it('should reject numbers less than 2', () => {
            document.getElementById('team-count').value = '0';
            const isValid = generator.validateTeamCount();
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-count-error').textContent,
                'Minimum 2 teams required'
            );
        });

        it('should reject non-numeric input', () => {
            document.getElementById('team-count').value = 'abc';
            const isValid = generator.validateTeamCount();
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-count-error').textContent,
                'Please enter a valid number greater than 0'
            );
        });

        it('should handle empty input', () => {
            document.getElementById('team-count').value = '';
            const isValid = generator.validateTeamCount();
            assert.strictEqual(isValid, false);
            assert.strictEqual(document.getElementById('team-count-error').textContent, '');
        });
    });

    describe('Team Name Validation', () => {
        beforeEach(() => {
            // Setup team inputs for testing
            generator.createTeamInputs(4);
        });

        it('should accept valid team names with letters and spaces', () => {
            const validNames = [
                'Arsenal',
                'Manchester United',
                'Real Madrid',
                'FC Barcelona',
                'Bayern Munich',
                'Liverpool FC'
            ];

            validNames.forEach((name, index) => {
                const teamIndex = index + 1;
                if (teamIndex <= 4) {
                    document.getElementById(`team-${teamIndex}`).value = name;
                    const isValid = generator.validateTeamName(teamIndex);
                    assert.strictEqual(isValid, true, `Name "${name}" should be valid`);
                    assert.strictEqual(
                        document.getElementById(`team-${teamIndex}-error`).textContent,
                        ''
                    );
                }
            });
        });

        it('should reject team names with numbers', () => {
            document.getElementById('team-1').value = 'Team123';
            const isValid = generator.validateTeamName(1);
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-1-error').textContent,
                'Only letters and spaces allowed'
            );
        });

        it('should reject team names with special characters', () => {
            const invalidNames = ['Team@', 'Team!', 'Team#', 'Team$', 'Team%'];
            
            invalidNames.forEach(name => {
                document.getElementById('team-1').value = name;
                const isValid = generator.validateTeamName(1);
                assert.strictEqual(isValid, false, `Name "${name}" should be invalid`);
                assert.strictEqual(
                    document.getElementById('team-1-error').textContent,
                    'Only letters and spaces allowed'
                );
            });
        });

        it('should reject team names longer than 40 characters', () => {
            const longName = 'A'.repeat(41);
            document.getElementById('team-1').value = longName;
            const isValid = generator.validateTeamName(1);
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-1-error').textContent,
                'Maximum 40 characters allowed'
            );
        });

        it('should accept team names exactly 40 characters long', () => {
            const exactName = 'A'.repeat(40);
            document.getElementById('team-1').value = exactName;
            const isValid = generator.validateTeamName(1);
            assert.strictEqual(isValid, true);
            assert.strictEqual(document.getElementById('team-1-error').textContent, '');
        });

        it('should reject empty team names', () => {
            document.getElementById('team-1').value = '';
            // Trigger validation as if user typed and deleted
            document.getElementById('team-1').value = ' ';
            document.getElementById('team-1').value = '';
            const isValid = generator.validateTeamName(1);
            assert.strictEqual(isValid, false);
        });

        it('should reject duplicate team names (case insensitive)', () => {
            document.getElementById('team-1').value = 'Arsenal';
            document.getElementById('team-2').value = 'arsenal';
            
            generator.validateTeamName(1);
            const isValid = generator.validateTeamName(2);
            
            assert.strictEqual(isValid, false);
            assert.strictEqual(
                document.getElementById('team-2-error').textContent,
                'Team name must be unique'
            );
        });

        it('should trim whitespace from team names', () => {
            document.getElementById('team-1').value = '  Arsenal  ';
            const isValid = generator.validateTeamName(1);
            assert.strictEqual(isValid, true);
            assert.strictEqual(document.getElementById('team-1-error').textContent, '');
        });
    });

    describe('Match Generation Logic', () => {
        beforeEach(() => {
            // Setup valid team count and names
            document.getElementById('team-count').value = '4';
            generator.createTeamInputs(4);
            
            document.getElementById('team-1').value = 'Arsenal';
            document.getElementById('team-2').value = 'Chelsea';
            document.getElementById('team-3').value = 'Liverpool';
            document.getElementById('team-4').value = 'Manchester United';
        });

        it('should generate correct number of matches', () => {
            generator.generateMatches();
            assert.strictEqual(generator.matches.length, 2);
        });

        it('should use all teams exactly once', () => {
            generator.generateMatches();
            
            const usedTeams = new Set();
            generator.matches.forEach(match => {
                usedTeams.add(match.team1);
                usedTeams.add(match.team2);
            });
            
            assert.strictEqual(usedTeams.size, 4);
            assert.strictEqual(generator.teams.length, 4);
        });

        it('should create different matchups on regeneration', () => {
            // Generate matches multiple times and check for variation
            const matchupSets = new Set();
            
            for (let i = 0; i < 10; i++) {
                generator.generateMatches();
                const matchupString = generator.matches
                    .map(match => `${match.team1}-${match.team2}`)
                    .sort()
                    .join('|');
                matchupSets.add(matchupString);
            }
            
            // With 4 teams, there should be multiple possible arrangements
            // This test might occasionally fail due to randomness, but it's very unlikely
            assert.ok(matchupSets.size > 1, 'Should generate different matchups');
        });

        it('should handle minimum team count (2 teams)', () => {
            document.getElementById('team-count').value = '2';
            generator.createTeamInputs(2);
            
            document.getElementById('team-1').value = 'Team A';
            document.getElementById('team-2').value = 'Team B';
            
            generator.generateMatches();
            assert.strictEqual(generator.matches.length, 1);
            assert.strictEqual(generator.matches[0].team1, 'Team A');
            assert.strictEqual(generator.matches[0].team2, 'Team B');
        });

        it('should handle maximum team count (30 teams)', () => {
            document.getElementById('team-count').value = '30';
            generator.createTeamInputs(30);
            
            for (let i = 1; i <= 30; i++) {
                document.getElementById(`team-${i}`).value = `Team ${i}`;
            }
            
            generator.generateMatches();
            assert.strictEqual(generator.matches.length, 15);
            
            const usedTeams = new Set();
            generator.matches.forEach(match => {
                usedTeams.add(match.team1);
                usedTeams.add(match.team2);
            });
            
            assert.strictEqual(usedTeams.size, 30);
        });
    });

    describe('UI State Management', () => {
        it('should enable proceed button only when team count is valid', () => {
            const proceedBtn = document.getElementById('proceed-to-teams');
            
            // Initially disabled
            assert.strictEqual(proceedBtn.disabled, true);
            
            // Invalid input keeps it disabled
            document.getElementById('team-count').value = '3';
            generator.validateTeamCount();
            assert.strictEqual(proceedBtn.disabled, true);
            
            // Valid input enables it
            document.getElementById('team-count').value = '4';
            generator.validateTeamCount();
            assert.strictEqual(proceedBtn.disabled, false);
        });

        it('should enable generate button only when all team names are valid', () => {
            generator.createTeamInputs(4);
            const generateBtn = document.getElementById('generate-matches');
            
            // Initially disabled
            assert.strictEqual(generateBtn.disabled, true);
            
            // Partially filled keeps it disabled
            document.getElementById('team-1').value = 'Arsenal';
            document.getElementById('team-2').value = 'Chelsea';
            generator.validateTeamName(1);
            generator.validateTeamName(2);
            generator.updateGenerateButton();
            assert.strictEqual(generateBtn.disabled, true);
            
            // All valid names enable it
            document.getElementById('team-3').value = 'Liverpool';
            document.getElementById('team-4').value = 'Manchester United';
            generator.validateTeamName(3);
            generator.validateTeamName(4);
            generator.updateGenerateButton();
            assert.strictEqual(generateBtn.disabled, false);
        });

        it('should reset application state when starting over', () => {
            // Setup some state
            document.getElementById('team-count').value = '4';
            generator.teams = ['Arsenal', 'Chelsea'];
            generator.matches = [{ team1: 'Arsenal', team2: 'Chelsea' }];
            
            generator.startOver();
            
            assert.strictEqual(document.getElementById('team-count').value, '');
            assert.strictEqual(generator.teams.length, 0);
            assert.strictEqual(generator.matches.length, 0);
            assert.strictEqual(document.getElementById('proceed-to-teams').disabled, true);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle odd number of teams gracefully in match generation', () => {
            // Manually set up an odd number of teams (this shouldn't happen in normal flow)
            generator.teams = ['Team1', 'Team2', 'Team3'];
            
            // Should not crash and should log error
            generator.createRandomMatches();
            
            // Should not create any matches
            assert.strictEqual(generator.matches.length, 0);
        });

        it('should handle empty team names in collection', () => {
            document.getElementById('team-count').value = '4';
            generator.createTeamInputs(4);
            
            // Set some empty values
            document.getElementById('team-1').value = 'Arsenal';
            document.getElementById('team-2').value = '';
            document.getElementById('team-3').value = 'Liverpool';
            document.getElementById('team-4').value = 'Manchester United';
            
            generator.collectTeamNames();
            
            // Should only collect non-empty names
            assert.strictEqual(generator.teams.length, 3);
            assert.ok(generator.teams.includes('Arsenal'));
            assert.ok(generator.teams.includes('Liverpool'));
            assert.ok(generator.teams.includes('Manchester United'));
            assert.ok(!generator.teams.includes(''));
        });

        it('should handle special characters in validation correctly', () => {
            generator.createTeamInputs(2);
            
            const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '='];
            
            specialChars.forEach(char => {
                document.getElementById('team-1').value = `Team${char}`;
                const isValid = generator.validateTeamName(1);
                assert.strictEqual(isValid, false, `Character "${char}" should be invalid`);
            });
        });

        it('should validate maximum character limit precisely', () => {
            generator.createTeamInputs(3);
            
            // Test exactly at the limit
            const exactly40 = 'A'.repeat(40);
            document.getElementById('team-1').value = exactly40;
            assert.strictEqual(generator.validateTeamName(1), true);
            
            // Test one character over the limit
            const over40 = 'A'.repeat(41);
            document.getElementById('team-2').value = over40;
            assert.strictEqual(generator.validateTeamName(2), false);
            
            // Test well under the limit
            const under40 = 'Arsenal';
            document.getElementById('team-3').value = under40;
            assert.strictEqual(generator.validateTeamName(3), true);
        });
    });
});