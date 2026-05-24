async function mockGoogleIdentity(page) {
  // Replace Google GSI script with a lightweight in-page mock for stable E2E assertions.
  await page.route('https://accounts.google.com/gsi/client', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body:
        '(() => {\n' +
        '  window.__googleMock = { initializeCalled: false, hasCallback: false, initializeConfig: null, promptCalls: 0, renderCalls: [] };\n' +
        '  window.google = {\n' +
        '    accounts: {\n' +
        '      id: {\n' +
        '        initialize(config) {\n' +
        '          window.__googleMock.initializeCalled = true;\n' +
        "          window.__googleMock.hasCallback = typeof config.callback === 'function';\n" +
        '          window.__googleMock.initializeConfig = { client_id: config.client_id };\n' +
        '          window.__googleMock.callback = config.callback;\n' +
        '        },\n' +
        '        renderButton(el, options) {\n' +
        '          window.__googleMock.renderCalls.push({ id: el ? el.id : null, options });\n' +
        '          if (!el) return;\n' +
        "          const button = document.createElement('button');\n" +
        "          button.type = 'button';\n" +
        "          button.setAttribute('data-testid', 'mock-google-button');\n" +
        "          button.textContent = 'Continue with Google';\n" +
        '          el.replaceChildren(button);\n' +
        '        },\n' +
        '        prompt() { window.__googleMock.promptCalls += 1; },\n' +
        '      },\n' +
        '    },\n' +
        '  };\n' +
        '})();',
    });
  });
}

async function getGoogleMockState(page) {
  // Expose captured mock telemetry (initialize/prompt/render/callback) to test assertions.
  return page.evaluate(() => window.__googleMock);
}

module.exports = {
  mockGoogleIdentity,
  getGoogleMockState,
};
