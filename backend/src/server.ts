import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
})