const axios = require('axios');

/**
 * Busca coordenadas (lat, lng) para um endereço usando OpenStreetMap (Nominatim)
 */
async function geocodeAddress(address) {
  try {
    // Adicionamos um delay para respeitar os limites da API gratuita do Nominatim
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'EntregasFacil/1.0' // Importante para Nominatim
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error(`Erro ao geocodificar: ${address}`, error.message);
    return null;
  }
}

module.exports = { geocodeAddress };
