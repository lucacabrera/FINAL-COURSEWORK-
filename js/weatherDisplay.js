class WeatherDisplay {
  showWeather(location, temp, wind, condition) {
    const outputBox = document.getElementById("weather-output"); //makes the varibles for setting HTML elements
    const locationEl = document.getElementById("location");
    const tempEl = document.getElementById("temperature");
    const windEl = document.getElementById("wind");
    const conditionEl = document.getElementById("condition");

    locationEl.textContent = `Location: ${location}`; //sets the content of the elements
    tempEl.textContent = `Temperature: ${temp}°C`;
    windEl.textContent = `Wind Speed: ${wind}mph`;
    conditionEl.textContent = `Condition: ${condition.text}`;
    this.#displayIcon(condition);
    this.#makeOutputVisible(outputBox);
  }

  showError(message) { //displays error message
    const errorBox = document.getElementById("error-box");
    errorBox.textContent = `ERROR: ${message}`;
    this.#styleErrorBoxRed(errorBox);

    this.#wait(5).then(() => {
      this.#hideErrorBox(errorBox);
    });
  }

  #displayIcon(conditionData) { //displaying icons for weather conditions
    const iconEl = document.getElementById("weather-icon");
    iconEl.src = "https:" + conditionData.icon; //making the custom icon URL for the API
    iconEl.alt = conditionData.text; //setting alt text on images based off of conditions
  }

  #makeOutputVisible(outputBox) { //making output box appear
    outputBox.style.display = "block";
  }

  #styleErrorBoxRed(errorBox) { //styling the error message box
    errorBox.style.display = "block";
    errorBox.style.color = "#fff";
    errorBox.style.backgroundColor = "red";
    errorBox.style.padding = "10px";
    errorBox.style.borderRadius = "5px";
  }

  #wait(seconds) { //waiting until promise is resolved
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  #hideErrorBox(errorBox) {
    errorBox.style.display = "none";
  }
}

export default WeatherDisplay;
