import axios from 'axios';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Feather as Icon } from '@expo/vector-icons';
import {
	View,
	Image,
	ImageBackground,
	Text,
	StyleSheet,
	TextInput,
	Picker,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native';
import { CustomPicker } from 'react-native-custom-picker';

interface IBGEUFResponse {
	sigla: string;
	nome: string;
}

interface IBGECityResponse {
	nome: string;
}

const Home = () => {
	const navigation = useNavigation();

	// const [uf, setUf] = useState('');
	// const [city, setCity] = useState('');

	const [ufs, setUfs] = useState<string[]>([]);
	const [cities, setCities] = useState<string[]>([]);

	const [selectedUf, setSelectedUf] = useState('0');
	const [selectedCity, setSelectedCity] = useState('0');

	function handleNavigateToPoints() {
		navigation.navigate('Points', {
			selectedUf,
			selectedCity,
		});
	}

	//Pega sigla dos estados brasileiros via API do IBGE
	useEffect(() => {
		axios
			.get<IBGEUFResponse[]>(
				'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
			)
			.then((response) => {
				const ufInitials = response.data.map((item) => item.sigla);
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

	// //Event Handlers
	// function handleSelectUf(e: ChangeEvent<RNPickerSelect>) {
	// 	const uf = e.target.value;

	// 	setSelectedUf(uf);
	// }

	// function handleSelectCity(e: ChangeEvent<RNPickerSelect>) {
	// 	const city = e.target.value;

	// 	setSelectedCity(city);
	// }

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ImageBackground
				source={require('../../assets/home-background.png')}
				style={styles.container}
				imageStyle={{ width: 274, height: 368 }}>
				<View style={styles.main}>
					<Image source={require('../../assets/logo.png')} />

					<View>
						<Text style={styles.title}>
							Seu marketplace de coleta de resíduos.
						</Text>
						<Text style={styles.description}>
							Ajudamos pessoas a encontrarem pontos de coleta de forma
							eficiente.
						</Text>
					</View>
				</View>

				<View style={styles.footer}>
					<CustomPicker
						modalAnimationType='fade'
						maxHeight={300}
						style={styles.input}
						placeholder='Selecione a sua UF'
						options={ufs}
						onValueChange={(value) => setSelectedUf(value)}
					/>

					<CustomPicker
						style={styles.input}
						maxHeight={300}
						placeholder='Selecione a sua Cidade'
						options={cities}
						onValueChange={(value) => setSelectedCity(value)}
					/>

					{/* <CustomPicker
						style={styles.input}
						selectedValue={selectedUf}
						onValueChange={(value, index) => setSelectedUf(value)}>
						{ufs.map((item, i) => (
							<Picker.Item label={item} value={item} key={i} />
						))}
					</CustomPicker>

					<Picker
						style={styles.input}
						selectedValue={selectedCity}
						onValueChange={(value, index) => setSelectedCity(value)}>
						{cities.map((item, i) => (
							<Picker.Item label={item} value={item} key={i} />
						))}
					</Picker> */}

					<RectButton
						style={styles.button}
						onPress={handleNavigateToPoints}>
						<View style={styles.buttonIcon}>
							<Icon name='arrow-right' color='#fff'></Icon>
						</View>
						<Text style={styles.buttonText}>Entrar</Text>
					</RectButton>
				</View>
			</ImageBackground>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 32,
	},

	main: {
		flex: 1,
		justifyContent: 'center',
	},

	title: {
		color: '#322153',
		fontSize: 32,
		fontFamily: 'Ubuntu_700Bold',
		maxWidth: 260,
		marginTop: 64,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 16,
		fontFamily: 'Roboto_400Regular',
		maxWidth: 260,
		lineHeight: 24,
	},

	footer: {},

	select: {},

	input: {
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 32,
		paddingHorizontal: 24,
		fontSize: 16,
		height: 100,
		width: '100%',
	},

	button: {
		backgroundColor: '#34CB79',
		height: 60,
		flexDirection: 'row',
		borderRadius: 10,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 8,
	},

	buttonIcon: {
		height: 60,
		width: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	buttonText: {
		flex: 1,
		justifyContent: 'center',
		textAlign: 'center',
		color: '#FFF',
		fontFamily: 'Roboto_500Medium',
		fontSize: 16,
	},
});

export default Home;
