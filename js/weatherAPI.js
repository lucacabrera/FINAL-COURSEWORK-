class WeatherAPI {
  constructor() {
    this.apiKey = "782a8a48a31243f89a8123853252304";
    this.baseURL = "https://api.weatherapi.com/v1/forecast.json";
  }

  async fetchWeather(location) {
    const url = `${this.baseURL}?key=${this.apiKey}&q=${location}&days=1`;
    const response = await this.sendRequest(url);

    if (response && response.weather && response.hourlyWindData) {
      const temperature = response.main.temp || 0;
      const condition = response.weather[0];
      const hourlyWindData = response.hourlyWindData;
      return [temperature, condition, hourlyWindData];
    } else {
      return ["error"];
    }
  }

  async sendRequest(url) {
    try {
      const rawData = await fetch(url).then((res) => res.json());

      const temperatureCelsius = rawData.current.temp_c;
      const weatherDescription = rawData.current.condition.text.toLowerCase();
      const windSpeedKph = rawData.current.wind_kph;
      const windDegree = rawData.current.wind_degree;

      const hourlyWindData =
        rawData.forecast?.forecastday?.[0]?.hour?.map((hour) => ({
          speed: hour.wind_kph || 0,
          degree: hour.wind_degree || 0,
        })) || [];

      return {
        main: { temp: temperatureCelsius },
        wind: { speed: windSpeedKph, degree: windDegree },
        weather: [
          {
            description: weatherDescription,
            icon: rawData.current.condition.icon,
            text: rawData.current.condition.text,
            code: rawData.current.condition.code,
          },
        ],
        hourlyWindData,
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      return null;
    }
  }

  #validateData(response) {
    if (
      response &&
      response.current?.temp_c !== undefined &&
      response.current?.wind_kph !== undefined &&
      response.current?.wind_degree !== undefined &&
      response.current?.condition
    ) {
      return {
        main: { temp: response.current.temp_c },
        wind: {
          speed: response.current.wind_kph,
          degree: response.current.wind_degree,
        },
        weather: [
          {
            description: response.current.condition.text.toLowerCase(),
            icon: response.current.condition.icon,
            text: response.current.condition.text,
            code: response.current.condition.code,
          },
        ],
      };
    } else {
      return {
        main: { temp: 0 },
        wind: { speed: 0, degree: 0 },
        weather: [{ description: "unknown", text: "unknown", icon: "" }],
      };
    }
  }
}

export default WeatherAPI;
