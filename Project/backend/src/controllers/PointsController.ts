import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
	async create(request: Request, response: Response) {
		//Pega os dados do corpo da requisição
		const {
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
			items,
		} = request.body;

		//Cria uma transaction para evitar execução assíncrona caso ocorra algum erro
		//!!!!Usar trx.commit() para realizar a ação caso não haja erro!!!!
		const trx = await knex.transaction();

		//Armazena os dados enviados no banco de dados via knex e recebe o ID recém criado
		const point = {
			image:
				'https://images.unsplash.com/photo-1573481078935-b9605167e06b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
			name,
			email,
			whatsapp,
			latitude,
			longitude,
			city,
			uf,
		};

		const insertedIds = await trx('points').insert(point);

		//Relacionamento com a tabela pivot usando o ID retornado pelo POST
		const point_id = insertedIds[0];
		const pointItems = items.map((item_id: number) => {
			return {
				item_id,
				point_id,
			};
		});

		await trx('point_items').insert(pointItems);

		await trx.commit();

		return response.status(201).json({
			id: point_id,
			...point,
		});
	}

	async index(request: Request, response: Response) {
		const { city, uf, items } = request.query;

		const parsedItems = String(items)
			.split(',')
			.map((item) => Number(item.trim()));

		const points = await knex('points')
			.join('point_items', 'points.id', '=', 'point_items.point_id')
			.whereIn('point_items.item_id', parsedItems)
			.where('city', String(city))
			.where('uf', String(uf))
			.distinct()
			.select('points.*');

		if (!points || points.length == 0) {
			console.log(points);
			return response.status(404).json('Filtred Points not found.');
		}
		return response.status(302).json(points);
	}

	async show(request: Request, response: Response) {
		const point_id = request.params.id;

		const point = await knex('points').where('id', point_id).first();

		if (!point) {
			return response.status(404).json({ message: 'Point not found' });
		}

		const items = await knex('items')
			.join('point_items', 'items.id', '=', 'point_items.item_id')
			.where('point_items.point_id', point_id)
			.select('items.title');

		return response.status(302).json({ point, items });
	}
}

export default PointsController;
