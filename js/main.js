import WeatherAPI from "./weatherAPI.js";
import WeatherDisplay from "./weatherDisplay.js";
import WeatherDiagrams from "./weatherDiagrams.js";

window.onload = () => {
  const api = new WeatherAPI();
  const display = new WeatherDisplay();

  const cities = [
    "London",
    "New York",
    "Tokyo",
    "Paris",
    "Sydney",
    "Berlin",
    "Madrid",
    "Toronto",
    "Rome",
    "Dubai",
  ];

  const searchInput = document.getElementById("location-search");
  const dropdown = document.getElementById("location-select");
  const getWeatherBtn = document.getElementById("get-weather-btn");

  function populateDropdown(filter = "") {
    dropdown.innerHTML = "";
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(filter.toLowerCase())
    );
    filtered.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
    dropdown.style.display = filtered.length > 0 ? "block" : "none";
  }

  searchInput.addEventListener("focus", () => populateDropdown());
  searchInput.addEventListener("input", () =>
    populateDropdown(searchInput.value)
  );

  dropdown.addEventListener("change", () => {
    searchInput.value = dropdown.value;
    dropdown.style.display = "none";
  });

  document.addEventListener("click", (e) => {
    if (e.target !== searchInput && e.target !== dropdown) {
      dropdown.style.display = "none";
    }
  });

  searchInput.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.style.display = "block";
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());

  let dropdownJustOpened = false;
  searchInput.addEventListener("focus", () => {
    dropdown.style.display = "block";
    dropdownJustOpened = true;
    setTimeout(() => {
      dropdownJustOpened = false;
    }, 100);
  });

  document.addEventListener("click", (e) => {
    if (
      !dropdownJustOpened &&
      e.target !== searchInput &&
      !dropdown.contains(e.target)
    ) {
      dropdown.style.display = "none";
    }
  });

  getWeatherBtn.addEventListener("click", () => {
    const location = searchInput.value.trim();

    if (!location) {
      display.showError("Please enter a valid location.");
      return;
    }

    api.fetchWeather(location).then((result) => {
      if (result.length === 3 && result[0] !== "error") {
        const [temp, condition, hourlyWindData] = result;
        display.showWeather(location, temp, condition);
        const container = document.getElementById("diagram-container");
        container.innerHTML = "";
        WeatherDiagrams.drawWindRose(hourlyWindData);
        const hourlyTempData = hourlyWindData.map((hour, index) => ({
          hour: index, 
          temp: hour.temp ?? temp, 
          wind: hour.speed,
        }));
        WeatherDiagrams.drawTemperatureGraph(hourlyTempData);
      } else {
        display.showError("Unable to fetch weather for " + location);
      }
    });
  });
};
