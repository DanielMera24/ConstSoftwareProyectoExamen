import { JSDOM } from 'jsdom';

// Setup DOM environment for testing
const dom = new JSDOM(`
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
`, { url: 'http://localhost' });

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;

// Mock console methods for cleaner test output
global.console.log = () => {};
global.console.error = () => {};