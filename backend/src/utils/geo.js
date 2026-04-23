/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * (Distância em linha reta sobre a curvatura da Terra)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Algoritmo do Vizinho Mais Próximo
 * Ordena a lista de entregas para que cada parada seja a mais próxima da anterior
 */
function sortRoutes(startPoint, locations) {
  let currentPoint = startPoint;
  const unvisited = [...locations];
  const route = [];

  while (unvisited.length > 0) {
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(
        currentPoint.lat,
        currentPoint.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );

      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const nextStop = unvisited.splice(closestIndex, 1)[0];
    route.push(nextStop);
    currentPoint = nextStop;
  }

  return route;
}

module.exports = { calculateDistance, sortRoutes };
