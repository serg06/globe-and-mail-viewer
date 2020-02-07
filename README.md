# Globe and Mail article viewer/extractor

Globe and Mail's site is too laggy and cluttered. This app extracts the article text for you.

Site: https://serg06.github.io/globe-and-mail-viewer/

---

# How it works

[index.html](/index.html) and [index.js](/index.js) store the website's code. It's just a static page that sends over the Globe and Mail article URL to the AWS Lambda function, gets back all the paragraphs from the article, and displays them.

[lambda_function.js](/lambda_function.js) is the function running on AWS Lambda. It validates the URL, gets the article at the URL, then efficiently parses it to extract the article text.

---

# First time setup

Site setup:

- Fork my repo
- Enable Github Pages using the master branch and the Jekyll Time Machine theme

AWS Lambda setup:

- Create an AWS function with default execution role and 192MB memory. (The app only uses ~90MB, but Lambda CPU speed scales with memory quantity and 192MB seems to be a sweet spot.)
- Set the runtime to `Node.js 12.x` and the handler to `lambda_function.handler`.
- Create an API Gateway GET access point to the lambda function.

Repo setup:

- Clone repo.
- Fix the site URL in README.md
- In the cloned repo, run `npm install`.
- In [lambda_function.js](/lambda_function.js), change the CORS allowed origin URL to your own github.io URL.

---

# Deployment

Site deployment:

- Just change index.html/js and push.

AWS Lambda deployment:

- Add [node_modules](/node_modules) and [lambda_function.js](/lambda_function.js) to a .zip.
- Go to Lambda and upload that zip as the code.
- Hit Save (top-right.)
- Note: Since [node_modules](/node_modules) is included in the build, try not to include any extra/unused packages along with it.

