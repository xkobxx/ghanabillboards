import 'dotenv/config';
import { createApp } from './app';

const PORT = Number(process.env.GATEWAY_PORT) || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
