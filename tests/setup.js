import { JSDOM } from 'jsdom';

// Setup DOM environment for testing
const dom = new JSDOM(
  `
<!DOCTYPE html>
<html>
<head>
    <title>Test Environment</title>
</head>
<body>
    <div class="container">
        <section id="team-count-section" class="section active">
            <div class="card">
                <div class="input-group">
                    <input type="number" id="team-count" min="2" max="30">
                    <div id="team-count-error" class="error-message"></div>
                </div>
                <button id="proceed-to-teams" class="btn btn-primary" disabled>Next</button>
            </div>
        </section>

        <section id="team-names-section" class="section">
            <div class="card">
                <div id="team-inputs-container" class="team-inputs"></div>
                <button id="back-to-count" class="btn btn-secondary">Back</button>
                <button id="generate-matches" class="btn btn-primary" disabled>Generate</button>
            </div>
        </section>

        <section id="matches-section" class="section">
            <div class="card">
                <div id="matches-container" class="matches-container"></div>
                <button id="regenerate-matches" class="btn btn-secondary">Regenerate</button>
                <button id="start-over" class="btn btn-primary">Start Over</button>
            </div>
        </section>
    </div>
</body>
</html>
`,
  {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
  }
);

// Setup global DOM environment
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// Handle navigator property safely (it's read-only in newer Node.js)
try {
  global.navigator = dom.window.navigator;
} catch (error) {
  // If we can't set navigator, that's okay for our tests
  console.log(
    'Note: Could not set global.navigator (this is normal in newer Node.js versions)'
  );
}

// Mock console methods for cleaner test output if needed
// Comment these out if you want to see console output during debugging
// global.console.log = () => {};
// global.console.error = () => {};

// Make sure window object has all the properties it needs
Object.defineProperty(global.window, 'location', {
  value: {
    href: 'http://localhost',
    origin: 'http://localhost',
  },
  writable: true,
});
