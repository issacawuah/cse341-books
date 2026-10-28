// THIS HANDLES REQUEST TO THE SERVER AND SEND BACK THE RESPONDS 
import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Books API' });
});

export default app;