const axios = require('axios');

const apiKey = 'AIzaSyBgfNvWwvFWG7hvaSQ7bcxqw0Itf88eYk8';
const address = 'Conj Paar';

// Codificar a string de pesquisa para que seja segura para usar em uma URL
const encodedAddress = encodeURIComponent(address);

const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

axios.get(apiUrl)
  .then(response => {
    const results = response.data.results;
    if (results.length > 0) {
      const { formatted_address, geometry } = results[0];
      const { lat, lng } = geometry.location;
      console.log(`Resultado da pesquisa: ${formatted_address}`);
      console.log(`Coordenadas: Latitude ${lat}, Longitude ${lng}`);
    } else {
      console.log(`Nenhum resultado encontrado para o endereço ${address}`);
    }
  })
  .catch(error => {
    console.error('Ocorreu um erro ao pesquisar o endereço:', error.message);
  });
