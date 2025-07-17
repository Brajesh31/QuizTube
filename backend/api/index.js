import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { userRouter } from '../routes/user.route.js';
import { workspaceRouter } from '../routes/workspace.route.js';

//configarations
dotenv.config();
connectDB();
const app = express();

// middle wares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello, this is the MCQ generation API!');
});
app.use('/auth', userRouter);
app.use('/api', workspaceRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});