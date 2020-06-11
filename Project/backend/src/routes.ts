import express from 'express';

//Controllers
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();

const pointsController = new PointsController();
const itemsController = new ItemsController();

//Items ROUTE
routes.get('/items', itemsController.index);

//Poitns ROUTE
//GETs
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

//POSTs
routes.post('/points', pointsController.create);

export default routes;
