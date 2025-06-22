# Football Match Generator - Unit Test Suite

This directory contains comprehensive unit tests for the Football Match Generator application.

## Test Structure

### Files
- `setup.js` - Test environment setup with JSDOM
- `FootballMatchGenerator.test.js` - Unit tests for all core functionality
- `README.md` - This documentation file

## Test Coverage

### Unit Tests (`FootballMatchGenerator.test.js`)

#### Team Count Validation
- ✅ Valid even numbers (2-30)
- ✅ Invalid odd numbers
- ✅ Numbers outside range (>30, <2)
- ✅ Non-numeric input
- ✅ Empty input handling

#### Team Name Validation
- ✅ Valid names (letters and spaces only)
- ✅ Invalid characters (numbers, special chars)
- ✅ **Length validation (max 40 characters exactly)**
- ✅ Empty name rejection
- ✅ Duplicate name detection (case insensitive)
- ✅ Whitespace trimming

#### Match Generation Logic
- ✅ Correct number of matches generated
- ✅ All teams used exactly once
- ✅ Random matchup generation
- ✅ Various team count scenarios (2, 4, 30)
- ✅ Edge case handling

#### UI State Management
- ✅ Button enable/disable logic
- ✅ Form validation states
- ✅ Application reset functionality

#### Error Handling & Edge Cases
- ✅ Odd team count handling
- ✅ Empty team name collection
- ✅ Special character validation
- ✅ **Precise character limit testing (exactly 40, 41, under 40)**
- ✅ Boundary condition testing

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run Unit Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Requirements Covered

### Validation Requirements
- [x] Team count must be positive integer (2-30)
- [x] Team count must be even number
- [x] Team names must contain only letters and spaces
- [x] **Team names must be maximum 40 characters**
- [x] Team names cannot be empty
- [x] Team names must be unique (case insensitive)

### Functionality Requirements
- [x] Random match generation
- [x] Correct pairing (teams used exactly once)
- [x] Proper number of matches (team count ÷ 2)
- [x] Match regeneration capability

### UI Requirements
- [x] Real-time validation feedback
- [x] Error message display
- [x] Button state management
- [x] Application reset

### Edge Cases
- [x] Minimum team count (2)
- [x] Maximum team count (30)
- [x] **Maximum name length (exactly 40 chars)**
- [x] Special character handling
- [x] Whitespace handling
- [x] Duplicate detection

## Test Environment

The tests use:
- **Node.js built-in test runner** - No external testing framework required
- **JSDOM** - DOM simulation for browser environment testing
- **ES Modules** - Modern JavaScript module system

## Coverage Statistics

The unit test suite provides comprehensive coverage of:
- **Validation Logic**: 100% of validation rules tested
- **Match Generation**: All algorithms and edge cases covered
- **UI State Management**: Button states and form validation
- **Error Handling**: All error conditions and edge cases tested

## Key Test Features

- **Precise Character Limit Testing**: Tests exactly 40 characters (valid), 41 characters (invalid), and various lengths
- **Comprehensive Validation**: Every validation rule is tested with multiple scenarios
- **Edge Case Coverage**: Handles all boundary conditions and error states
- **Realistic Test Data**: Uses actual football team names for realistic testing

## Adding New Tests

When adding new features or modifying existing functionality:

1. Add unit tests to `FootballMatchGenerator.test.js` for isolated functionality
2. Update this README with new test coverage information
3. Ensure all edge cases and error conditions are covered
4. Test both valid and invalid inputs for every validation rule