// IT READS THE PORT AND LISTEN TO THE SERVER

import app from './app.js';

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT is missing. Check your .env file.');
}

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});