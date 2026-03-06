const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("PAGE ERROR:", msg.text());
    } else {
      console.log("PAGE LOG:", msg.text());
    }
  });

  page.on("pageerror", (error) => {
    console.log("PAGE UNCAUGHT ERROR:", error.message);
  });

  console.log("Navigating to local site...");
  await page.goto("http://127.0.0.1:5173/");

  // Wait a bit, then try to start a game
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Entering Lobby...");
  const enterBtn = await page.$("button");
  if (enterBtn) {
    const txt = await page.evaluate((el) => el.textContent, enterBtn);
    console.log("Clicking:", txt);
    await enterBtn.click();
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log("Creating Room...");
  const createBtn = await page.$('button[class*="btn-green"]');
  if (createBtn) {
    const txt = await page.evaluate((el) => el.textContent, createBtn);
    console.log("Clicking:", txt);
    await createBtn.click();
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log("Confirming Room...");
  const confirmCreateBtn =
    (await page.$('button:contains("Create Room")')) ||
    (await page.evaluateHandle(() =>
      Array.from(document.querySelectorAll("button")).find(
        (el) => el.textContent === "Create Room",
      ),
    ));
  if (confirmCreateBtn) {
    await confirmCreateBtn.click();
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log("Readying Up...");
  const readyBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll("button")).find(
      (el) => el.textContent === "READY UP",
    ),
  );
  if (readyBtn) {
    await readyBtn.click();
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log("Starting Round...");
  const startBtn = await page.evaluateHandle(() =>
    Array.from(document.querySelectorAll("button")).find(
      (el) => el.textContent === "START ROUND",
    ),
  );
  if (startBtn) {
    await startBtn.click();
  }

  console.log("Waiting for round to start and seeing if crash logs appear...");
  await new Promise((r) => setTimeout(r, 5000));

  await browser.close();
  console.log("Done");
})().catch(console.error);
