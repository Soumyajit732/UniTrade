const { spawn } = require("child_process");
const path = require("path");

let aiPriceProcess = null;

function startAiPriceService() {
  if (process.env.START_AI_PRICE_SERVICE === "false") {
    return null;
  }

  if (aiPriceProcess) {
    return aiPriceProcess;
  }

  const repoRoot = path.resolve(__dirname, "..", "..");
  const pythonBin = process.env.PYTHON_BIN || "python3";
  const host = process.env.AI_PRICE_SERVICE_HOST || "127.0.0.1";
  const port = process.env.AI_PRICE_SERVICE_PORT || "8001";

  aiPriceProcess = spawn(
    pythonBin,
    ["-m", "uvicorn", "ai.ai_price_api:app", "--host", host, "--port", String(port)],
    {
      cwd: repoRoot,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  aiPriceProcess.stdout.on("data", (data) => {
    console.log(`[ai-price] ${data.toString().trim()}`);
  });

  aiPriceProcess.stderr.on("data", (data) => {
    console.warn(`[ai-price] ${data.toString().trim()}`);
  });

  aiPriceProcess.on("exit", (code, signal) => {
    if (code !== 0 && signal === null) {
      console.warn(`[ai-price] service exited with code ${code}`);
    }
    aiPriceProcess = null;
  });

  function stopAiPriceService() {
    if (aiPriceProcess && !aiPriceProcess.killed) {
      aiPriceProcess.kill();
    }
  }

  process.once("exit", stopAiPriceService);

  return aiPriceProcess;
}

module.exports = {
  startAiPriceService
};
