const BACKEND_URL = 'http://localhost:3000';
const UPDATE_INTERVAL = 20000;

const map = L.map('map').setView([47.1585, 27.6014], 13); // Centru Iași

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

let vehicleMarkers = new Map();

async function updateVehicles() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/vehicles`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('vehicle-count').textContent = `${data.count} vehicule active`;
            document.getElementById('last-update').textContent = `Actualizat: ${new Date().toLocaleTimeString('ro-RO')}`;
            
            const currentVehicleIds = new Set();

            data.vehicles.forEach(vehicle => {
                currentVehicleIds.add(vehicle.id);
                
                if (vehicleMarkers.has(vehicle.id)) {
                    const marker = vehicleMarkers.get(vehicle.id);
                    marker.setLatLng([vehicle.lat, vehicle.lng]);
                } else {
                    const marker = L.circleMarker([vehicle.lat, vehicle.lng], {
                        radius: 8,
                        fillColor: getColorByType(vehicle.type),
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    });

                    marker.bindPopup(`
                        <strong>Vehicul ${vehicle.label}</strong><br>
                        Tip: ${getVehicleTypeName(vehicle.type)}<br>
                        Viteză: ${vehicle.speed} km/h
                    `);
                    
                    marker.addTo(map);
                    vehicleMarkers.set(vehicle.id, marker);
                }
            });
            
            vehicleMarkers.forEach((marker, id) => {
                if (!currentVehicleIds.has(id)) {
                    map.removeLayer(marker);
                    vehicleMarkers.delete(id);
                }
            });
        }
    } catch (error) {
        console.error('Eroare la actualizarea vehiculelor:', error);
        document.getElementById('vehicle-count').textContent = 'Eroare la încărcare';
    }
}

function getColorByType(type) {
    const colors = {
        0: '#9C27B0', // Tramvai - mov
        3: '#2196F3', // Autobuz - albastru
        11: '#4CAF50' // Troleibuz - verde
    };

    return colors[type] || '#757575';
}

function getVehicleTypeName(type) {
    const types = {
        0: 'Tramvai',
        3: 'Autobuz',  
        11: 'Troleibuz'
    };

    return types[type] || 'Necunoscut';
}

updateVehicles();
setInterval(updateVehicles, UPDATE_INTERVAL);