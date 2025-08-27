import app from "./app.js";
import { config } from "./config/index.js";
import { ScheduledScanner } from "./services/scheduledScanner.js";

const PORT = config.PORT;

// ScheduledScanner()

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
})