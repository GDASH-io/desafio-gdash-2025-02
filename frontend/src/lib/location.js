export async function detectUserCity() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocalização não suportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const res = await fetch(url, {
          headers: { "User-Agent": "weather-app" }
        });
        const data = await res.json();

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.state ||
          "Cidade Desconhecida";

        resolve({
          city,
          latitude,
          longitude
        });

      } catch (error) {
        reject("Erro ao obter cidade");
      }
    });
  });
}
