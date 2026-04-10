# Hacker Rank Test Suite: 
This is a sample of test cases I have implemented for the Hacker News website using Javascript and Playwright. It can be run with the command `npx playwright test`.

# A Note on the Login Scenarios:
# Edit:
Login related Scenarios are currently not functional due to CAPTCHA being implemented after these test scenarios were developed.

## Authentication Strategy

To reduce unnecessary login traffic and improve test stability, I implemented a shared authenticated session using Playwright’s `storageState`.

### Approach

- A one-time authentication step generates a `.auth/storageState.json` file.
- The user interaction test cases load this session so tests begin already authenticated.
- This avoids performing the UI login flow before every test and keeps execution fast and stable.

### Why This Design

Running the login flow repeatedly — especially in parallel across browsers — can:
- Slow down the suite
- Create unnecessary load on the target site
- Introduce instability due to repeated authentication

Persisting a single session allows:
- Parallel execution for the main test suite
- Cleaner separation of authentication from feature validation
- Reduced risk of rate limiting or session conflicts

### Logout Handling

The logout scenario is configured to run only once on a single browser project.  
This prevents multiple login/logout cycles from invalidating the shared session or generating redundant authentication requests.

This structure balances realistic authentication coverage with performance, stability, and responsible usage of the target application.



