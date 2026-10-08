import express from 'express';
import dotenv from 'dotenv';
import { moviesRouter } from './routes/movies.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => { res.json({ data: 'data received' }); });

app.use('/movies', moviesRouter);
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(process.env.PORT || 3000, () => { console.log('server ok'); }); 

