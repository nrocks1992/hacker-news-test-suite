# Edit: 

I decided to use Playwright's built in test runner to implement the assignment and my other test scripts. The completed test suite can be run with the command `npx playwright test`. The original assignment solution can be run with `npx playwright test tests/index.spec.js`.

# A Note on the Login Scenarios:

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

# 🐺 QA Wolf Take Home Assignment

Welcome to the QA Wolf take home assignment for our [QA Engineer](https://www.task-wolf.com/apply-qae) role! We appreciate your interest and look forward to seeing what you come up with.

## Instructions

This assignment has two questions as outlined below. When you are done, upload your assignment to our [application page](https://www.task-wolf.com/apply-qae):


### Question 1

In this assignment, you will create a script on [Hacker News](https://news.ycombinator.com/) using JavaScript and Microsoft's [Playwright](https://playwright.dev/) framework. 

1. Install node modules by running `npm i`.

2. Edit the `index.js` file in this project to go to [Hacker News/newest](https://news.ycombinator.com/newest) and validate that EXACTLY the first 100 articles are sorted from newest to oldest. You can run your script with the `node index.js` command.

Note that you are welcome to update Playwright or install other packages as you see fit, however you must utilize Playwright in this assignment.

### Question 2

Why do you want to work at QA Wolf? Please record a short, ~2 min video using [Loom](https://www.loom.com/) that includes:

1. Your answer 

2. A walk-through demonstration of your code, showing a successful execution

The answer and walkthrough should be combined into *one* video, and must be recorded using Loom as the submission page only accepts Loom links.

## Frequently Asked Questions

### What is your hiring process? When will I hear about next steps?

This take home assignment is the first step in our hiring process, followed by a final round interview if it goes well. **We review every take home assignment submission and promise to get back to you either way within two weeks (usually sooner).** The only caveat is if we are out of the office, in which case we will get back to you when we return. If it has been more than two weeks and you have not heard from us, please do follow up.

The final round interview is a 2-hour technical work session that reflects what it is like to work here. We provide a $150 stipend for your time for the final round interview regardless of how it goes. After that, there may be a short chat with our director about your experience and the role.

Our hiring process is rolling where we review candidates until we have filled our openings. If there are no openings left, we will keep your contact information on file and reach out when we are hiring again.

### Having trouble uploading your assignment?
Be sure to delete your `node_modules` file, then zip your assignment folder prior to upload. 

### How do you decide who to hire?

We evaluate candidates based on three criteria:

- Technical ability (as demonstrated in the take home and final round)
- Customer service orientation (as this role is customer facing)
- Alignment with our mission and values (captured [here](https://qawolf.notion.site/Mission-and-Values-859c7d0411ba41349e1b318f4e7abc8f))

This means whether we hire you is based on how you do during our interview process, not on your previous experience (or lack thereof). Note that you will also need to pass a background check to work here as our customers require this.

### How can I help my application stand out?

While the assignment has clear requirements, we encourage applicants to treat it as more than a checklist. If you're genuinely excited about QA Wolf, consider going a step further—whether that means building a simple user interface, adding detailed error handling or reporting, improving the structure of the script, or anything else that showcases your unique perspective.

There's no "right" answer—we're curious to see what you choose to do when given freedom and ambiguity. In a world where tools can help generate working code quickly and make it easier than ever to complete technical take-homes, we value originality and intentionality. If that resonates with you, use this assignment as a chance to show us how you think.

Applicants who approach the assignment as a creative challenge, not just a checklist, tend to perform best in our process.
