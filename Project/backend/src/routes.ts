import express from 'express';
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';
import config from './config/multer';

//Controllers
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const upload = multer(config);

const pointsController = new PointsController();
const itemsController = new ItemsController();

//Items ROUTE
routes.get('/items', itemsController.index);

//Poitns ROUTE
//GETs
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

//POSTs
routes.post(
	'/points',
	upload.single('image'),
	celebrate(
		{
			body: Joi.object().keys({
				name: Joi.string().required(),
				city: Joi.string().required(),
				items: Joi.string().required(),
				whatsapp: Joi.number().required(),
				latitude: Joi.number().required(),
				longitude: Joi.number().required(),
				uf: Joi.string().required().max(2),
				email: Joi.string().required().email(),
			}),
		},
		{
			abortEarly: false,
		}
	),
	pointsController.create
);

export default routes;
