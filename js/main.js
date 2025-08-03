import WeatherAPI from "./weatherAPI.js";
import WeatherDisplay from "./weatherDisplay.js";

window.onload = () => {
  //makes sure this only runs after all HTML is loaded
  const api = new WeatherAPI();
  const display = new WeatherDisplay();

  const cities = [
    //list of locations
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
    //fils the dropdown with locations from the array
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

    //only show dropdown if theres at least 1 result
    dropdown.style.display = filtered.length > 0 ? "block" : "none";
  }

  searchInput.addEventListener("focus", () => {
    populateDropdown(); //load all cities
  });

  searchInput.addEventListener("input", () => {
    populateDropdown(searchInput.value);
  });

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

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

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
    //watches for the final button press
    const location = searchInput.value.trim();
    if (location) {
      api.fetchWeather(location).then((result) => {
        if (result.length === 3 && result[0] !== "error") {
          const [temp, wind, condition] = result;
          display.showWeather(location, temp, wind, condition);
        } else {
          display.showError("Unable to fetch weather for " + location);
        }
      });
    } else {
      display.showError("Please enter a valid location.");
    }
  });
};
