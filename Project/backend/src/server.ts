import express from 'express';
import routes from './routes';
import { errors } from 'celebrate';
import cors from 'cors';
import path from 'path';

//Main Variables
const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());
app.listen(port);
