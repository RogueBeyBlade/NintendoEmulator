const { Octokit } = require("@octokit/rest");

const owner = "RogueBeyBlade"; // Replace with your GitHub username
const repo = "NintendoEmulator"; // Replace with your repository name
const filePath = "counter.json"; // Update this if your counter.json file is elsewhere

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Access token from Netlify environment
});

exports.handler = async (event) => {
  try {
    const { game } = JSON.parse(event.body);

    if (!game) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Game name is required." }),
      };
    }

    // Get the current counter.json file
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const counters = JSON.parse(content);

    // Update the counter for the specific game
    counters[game] = (counters[game] || 0) + 1;

    // Encode updated content to base64
    const updatedContent = Buffer.from(JSON.stringify(counters, null, 2)).toString("base64");

    // Commit the updated file back to the repository
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Update counter for ${game}`,
      content: updatedContent,
      sha: data.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Counter updated successfully." }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating counter.", error: error.message }),
    };
  }
};
