//this file will have the code to take data from the API and parse it into usable data in my project.

class WeatherAPI {
  async fetchWeather(location) {
    this.apiKey = "782a8a48a31243f89a8123853252304";
    this.baseURL = "https://api.weatherapi.com/v1/current.json";
    const url = `${this.baseURL}?key=${this.apiKey}&q=${location}`; //makes the URL for the API
    const response = await this.sendRequest(url); //fetches the data

    if (response !== null) {
      const data = this.#validateData(response); //calls the validation method
      const temperature = data.main.temp;
      const wind = data.wind.speed;
      const condition = data.weather[0]; //gets the whole condition object
      return [temperature, wind, condition];
    } else {
      return ["error"];
    }
  }

  //sending API requests
  async sendRequest(url) {
    try {
      const response = await fetch(url);
      const rawData = await response.json();
      const temperatureCelsius = rawData.current.temp_c;
      const windSpeedKph = rawData.current.wind_kph;
      const weatherDescription = rawData.current.condition.text.toLowerCase();
      return {
        main: { temp: temperatureCelsius.toString() },
        wind: { speed: windSpeedKph.toString() },
        weather: [
          {
            description: weatherDescription,
            icon: rawData.current.condition.icon, //getting data for icons
            text: rawData.current.condition.text,
            code: rawData.current.condition.code,
          },
        ],
      };
    } catch (error) {
      console.error("error:", error); 
      return null;
    }
  }

  //make sure data could be valid
  #validateData(response) {
    if (
      response !== undefined &&
      response.main !== undefined &&
      response.main.temp !== undefined &&
      response.wind !== undefined &&
      response.wind.speed !== undefined &&
      response.weather !== undefined &&
      response.weather.length > 0 &&
      response.weather[0].description !== undefined
    ) {
      return response;
    } else {
      return { //placeholder values if data isnt correct
        main: { temp: "0" },
        wind: { speed: "0" },
        weather: [{ description: "unknown" }],
      };
    }
  }
}

export default WeatherAPI;
