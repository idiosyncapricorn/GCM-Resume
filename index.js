const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News "newest" page
  await page.goto("https://news.ycombinator.com/newest");

  // Extract post details for the first 100 articles
  const posts = await page.$$eval(".athing", rows => {
    return rows.slice(0, 100).map(row => {
      const title = row.querySelector(".titleline > a")?.innerText || "No title";
      const timeAgoElement = row.nextElementSibling?.querySelector(".age > a");
      const timeAgo = timeAgoElement ? timeAgoElement.innerText : "unknown";
      return { title, timeAgo };
    });
  });

  console.log("Extracted posts (first 100):", posts);

  // Convert timeAgo into minutes
  const timeInMinutes = posts.map(post => {
    const match = post.timeAgo.match(/(\d+)\s*(minute|hour|day)/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit.startsWith("minute")) return value;
      if (unit.startsWith("hour")) return value * 60;
      if (unit.startsWith("day")) return value * 1440;
    }
    return Infinity; // Unknown timestamps are treated as infinite
  });

  // Validate order
  const isSorted = timeInMinutes.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  console.log(`Posts (first 100) are sorted from newest to oldest: ${isSorted}`);

  // Close the browser
  await browser.close();
}

// Call the function
sortHackerNewsArticles().catch(console.error);
