const HISTORY_CITY = "weatherCitySearchHistory";
const HISTORY_BTN = "btn btn-info border text-left px-3 py-2";
const HISTORY_DATA = "data-city";
const API_KEY = "d77358b957f48bb5e0d0bc47f76aad4e";

let history = JSON.parse(localStorage.getItem(HISTORY_CITY));
if (!history) {
  history = [];
}

// weatherPage
$(weatherPage);

function weatherPage() {
  // search history
  cityHistory();
  // search form event handler
  $("#search-form").on("submit", handleSearch);
  // history item event handler
  $("#city-history").on("click", handleHistoryItemClick);

  // last searched city
  if (history.length > 0) {
    CityWeather(history[history.length - 1])
  }
}

function CityWeather(city) {
  // hide weather divs
  $("#current-weather").attr("style", "display: none;")
  $("#current-uv-element").attr("style", "display: none;")
  $("#future-weather").attr("style", "display: none;")

  // get current weather
  let currentQueryURL = "https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=" + API_KEY + "&q=" + city;
  $.ajax({
    url: currentQueryURL,
    method: "GET"
  }).then(function(response) {
    // UV Index
    let uvQueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + API_KEY + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
    $.ajax({
      url: uvQueryURL,
      method: "GET"
    }).then(function(response) {
      let uvIndex = response.value;
      $("#current-uv").text(uvIndex)
      // set background color and text color based on uv index
      $("#current-uv").attr("style", getUVColorStyle(uvIndex))

      // show uv element
      $("#current-uv-element").attr("style", "display: block;")
    });

    // update current weather
    $("#current-city").text(response.name + " (" + moment().format("l") + ")")
    $("#current-icon").attr("src", getWeatherIconURL(response.weather[0].icon))
    $("#current-temp").text(response.main.temp.toFixed(1));
    $("#current-humidity").text(response.main.humidity);
    $("#current-wind").text(response.wind.speed);

    // show current weather
    $("#current-weather").attr("style", "display: block;");
  });

  // future weather
  let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&appid=" + API_KEY + "&q=" + city;
  $.ajax({
    url: forecastQueryURL,
    method: "GET"
  }).then(function(response) {
    let listIndex = findGoodStartIndex(response);
    let list = response.list;

    // for loop to update all cards
    for (let i = 1; i <= 5; i++) {
      let dayCard = $("#forecast-day-" + i);

      // get the day 
      dayCard.find("h5").text(moment(list[listIndex].dt * 1000).format("l"));
      dayCard.find("img").attr("src", getWeatherIconURL(list[listIndex].weather[0].icon));
      dayCard.find(".temp").text(list[listIndex].main.temp.toFixed(1));
      dayCard.find(".humidity").text(list[listIndex].main.humidity);

      // set 24 hours later
      listIndex += 8;
    }

    // show forecast weather
    $("#future-weather").attr("style", "display: block;")
  });
}

function handleSearch(event) {
  event.preventDefault();

  // get the input from search box
  let city = $("#search-input").val().trim();
  // clear out the search box
  $("#search-input").val("");
  // add the city to our search history
  addCityHistory(city);
  // render the city's weather
  CityWeather(city);
}

function handleHistoryItemClick(event) {
  if (event.target.matches("button")) {
    CityWeather($(event.target).attr(HISTORY_DATA));
  }
}

function cityHistory() {
  // clear search history
  let searchHistory = $("#city-history").empty();

  // for each item in history array
  history.forEach(city => {
    // create a button and add classes/attributes
    let btn = $("<button>").addClass(HISTORY_BTN);
    btn.attr(HISTORY_DATA, city);
    btn.text(city);
    // append button to search history
    searchHistory.append(btn);
  });
}

function addCityHistory(city) {
  // not to add city in history twice
  if (!history.includes(city)) {
    history.push(city);
    localStorage.setItem(HISTORY_CITY, JSON.stringify(history));
    cityHistory();
  } 
}

// this function finds a good starting index in the list of 40 items (5-day 3-hour forecasts)
function findGoodStartIndex(response) {
  let list = response.list;
  let startIndex = 8;
  do {
    startIndex--;
    indexHour = parseInt(moment(list[startIndex].dt * 1000).format("H"));
  } while (indexHour >= 15 && startIndex > 0)

  return startIndex;
}
//set UV colors
function getUVColorStyle(uvIndex) {
  if (uvIndex <= 2) {
    return "background-color: green; color: white;";
  } else if (uvIndex <= 5) {
    return "background-color: gold; color: black";
  } else if (uvIndex <= 7) {
    return "background-color: goldenrod; color: black;";
  } else if (uvIndex <= 10) {
    return "background-color: firebrick; color: white;";
  } else {
    return "background-color: violet; color: black;";
  }
}
//weather icons
function getWeatherIconURL(iconCode) {
  return "https://openweathermap.org/img/w/" + iconCode + ".png";
}