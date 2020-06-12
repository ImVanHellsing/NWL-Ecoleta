import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { Link, useHistory } from 'react-router-dom';
//Assets / Components
import Logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';
//API
import api from '../../services/api';
//Style
import './styles.css';

interface Item {
	id: number;
	name: string;
	image_url: string;
}

interface IBGEUFResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {
	const history = useHistory();

	const [items, setItems] = useState<Item[]>([]);
	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		whatsapp: '',
	});

	const [selectedItems, setSelectedItems] = useState<number[]>([]);

	const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
		0,
		0,
	]);

	const [initialPosition, setInitialPosition] = useState<[number, number]>([
		0,
		0,
	]);

	const [selectedFile, setSelectedFile] = useState<File>();
	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');

	//Utiliza a localidade atual do sistema para setar Marker do mapa
	useEffect(() => {
		navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			setInitialPosition([latitude, longitude]);
		});
	}, []);

	//Pega sigla dos estados brasileiros via API do IBGE
	useEffect(() => {
		axios
			.get<IBGEUFResponse[]>(
				'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
			)
			.then((response) => {
				const ufInitials = response.data.map((uf) => uf.sigla);
				setUfs(ufInitials);
			});
	}, []);

	//Pega cidades por estados brasileiros via API do IBGE
	useEffect(() => {
		if (selectedUf === '0') return;
		axios
			.get<IBGECityResponse[]>(
				`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
			)
			.then((response) => {
				const cityNames = response.data.map((city) => city.nome);
				setCities(cityNames);
			});
	}, [selectedUf]);

	//Pega dados via API do backend da aplicação
	useEffect(() => {
		api.get('items').then((response) => {
			setItems(response.data);
		});
	}, []);

	//Event Handlers
	function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) {
		const uf = e.target.value;

		setSelectedUf(uf);
	}

	function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) {
		const city = e.target.value;

		setSelectedCity(city);
	}

	function handleMapClick(e: LeafletMouseEvent) {
		setSelectedPosition([e.latlng.lat, e.latlng.lng]);
	}

	function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItems.findIndex((item) => item === id);

		if (alreadySelected >= 0) {
			const filteredItems = selectedItems.filter((item) => item !== id);
			setSelectedItems(filteredItems);
		} else {
			setSelectedItems([...selectedItems, id]);
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();

		const { name, email, whatsapp } = formData;
		const [latitude, longitude] = selectedPosition;
		const uf = selectedUf;
		const city = selectedCity;
		const items = selectedItems;

		const data = new FormData();

		data.append('name', name);
		data.append('email', email);
		data.append('whatsapp', whatsapp);
		data.append('latitude', String(latitude));
		data.append('longitude', String(longitude));
		data.append('uf', uf);
		data.append('city', city);
		data.append('items', items.join(','));

		if (selectedFile) {
			data.append('image', selectedFile);
		}

		await api.post('points', data);

		alert('Novo ponto de Coleta criado com sucesso!');

		history.push('/');
	}

	return (
		<div id='page-create-point'>
			<header>
				<img src={Logo} alt='Ecoleta' />
				<Link to='/'>
					<FiArrowLeft />
					Voltar para Home
				</Link>
			</header>

			<form onSubmit={handleSubmit}>
				<h1>
					Cadastro do <br /> Ponto de Coleta
				</h1>

				<Dropzone onFileUploaded={setSelectedFile} />
				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>

					<div className='field'>
						<label htmlFor='name'>Nome de Entidade</label>
						<input
							type='text'
							name='name'
							id='name'
							onChange={handleInputChange}
						/>
					</div>

					<div className='field-group'>
						<div className='field'>
							<label htmlFor='email'>Email</label>
							<input
								type='email'
								name='email'
								id='email'
								onChange={handleInputChange}
							/>
						</div>

						<div className='field'>
							<label htmlFor='whatsapp'>Whatsapp</label>
							<input
								type='text'
								name='whatsapp'
								id='whatsapp'
								onChange={handleInputChange}
							/>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço no mapa</span>
					</legend>

					<Map center={initialPosition} zoom={25} onclick={handleMapClick}>
						<TileLayer
							attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
						/>

						<Marker position={selectedPosition} />
					</Map>

					<div className='field-group'>
						<div className='field'>
							<label htmlFor='uf'>Estado (UF)</label>
							<select
								name='uf'
								id='uf'
								onChange={handleSelectUf}
								value={selectedUf}>
								<option value='0'>Selecione uma UF</option>
								{ufs.map((uf) => (
									<option key={uf} value={uf}>
										{uf}
									</option>
								))}
							</select>
						</div>

						<div className='field'>
							<label htmlFor='City'>Cidade</label>
							<select
								name='City'
								id='City'
								value={selectedCity}
								onChange={handleSelectCity}>
								<option value='0'>Selecione uma Cidade</option>
								{cities.map((city) => (
									<option key={city} value={city}>
										{city}
									</option>
								))}
							</select>
						</div>
					</div>
				</fieldset>

				<fieldset>
					<legend>
						<h2>Ítems de Coleta</h2>
						<span>Selecione um ou mais items abaixo</span>
					</legend>

					<ul className='items-grid'>
						{items.map((item) => (
							<li
								key={item.id}
								onClick={() => handleSelectItem(item.id)}
								className={
									selectedItems.includes(item.id) ? 'selected' : ''
								}>
								<img src={item.image_url} alt={item.name} />
								<span>{item.name}</span>
							</li>
						))}
					</ul>
				</fieldset>

				<button type='submit'>Cadastrar ponto de coleta</button>
			</form>
		</div>
	);
};

export default CreatePoint;
