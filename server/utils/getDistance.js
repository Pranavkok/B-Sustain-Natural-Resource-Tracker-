import axios from "axios";

const API_KEY = "5b3ce3597851110001cf62487cdafc1e4da1442da3865dafd692682e";

// Function to get coordinates using OpenRouteService Geocoding API
async function getCoordinates(place) {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(place)}`;
    
    try {
        const response = await axios.get(url);
        if (response.data.features.length === 0) {
            throw new Error(`No coordinates found for ${place}`);
        }
        const { coordinates } = response.data.features[0].geometry;
        return {
            lon: coordinates[0], // Longitude
            lat: coordinates[1]  // Latitude
        };
    } catch (error) {
        throw new Error(`Error fetching coordinates for ${place}: ${error.message}`);
    }
}

// Function to get distance between two locations
export async function getDistance(from, to) {
    try {
        // Get coordinates for both locations
        const fromCoords = await getCoordinates(from);
        const toCoords = await getCoordinates(to);

        const url = `https://api.openrouteservice.org/v2/matrix/driving-car`;

        const data = {
            locations: [
                [fromCoords.lon, fromCoords.lat], // From (Longitude, Latitude)
                [toCoords.lon, toCoords.lat] // To (Longitude, Latitude)
            ],
            metrics: ["distance"]
        };

        const response = await axios.post(url, data, {
            headers: { "Authorization": API_KEY, "Content-Type": "application/json" }
        });

        const distanceInMeters = response.data.distances[0][1]; // Distance in meters
        return distanceInMeters / 1000; // Convert to KM
    } catch (error) {
        throw new Error(`Error fetching distance: ${error.message}`);
    }
}
