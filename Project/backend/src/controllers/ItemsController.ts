import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
	//Lista todos os Items Defualt da tabela
	async index(request: Request, response: Response) {
		const items = await knex('items').select('*');

		if (!items) return response.status(404).json({ erro: 'Data not found.' });

		const serializedItems = items.map((item) => {
			return {
				id: item.id,
				name: item.title,
				image_url: `http://192.168.0.11:3333/uploads/${item.image}`,
			};
		});

		return response.json(serializedItems);
	}
}

export default ItemsController;
