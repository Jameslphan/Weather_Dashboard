var APIkey = "48e45e55cf2923defe0fdc4cf8d383a8";

var city = $('#city-input');
var searchButton = $('#search-button');
var clearButton = $('#clear-button');
var pastCities = $('#past-searches');

var currentCity;

//Open Weather 'One Call API': get weather of city
function getWeather(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${APIkey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            //Current weather
            var currentCond = $('#currentConditions');
            currentCond.addClass('border border-primary');

            //Create city name element and display
            var cityName = $('<h2>');
            cityName.text(currentCity);
            currentCond.append(cityName);

            //Get current wind speed and display
            var currentCityWind = data.current.wind_speed;
            var currentWind = $('<p>')
            currentWind.text(`Wind: ${currentCityWind} KPH`)
            currentCond.append(currentWind);
            
            //Get date and display
            var currentCityDate = data.current.dt;
            currentCityDate = moment.unix(currentCityDate).format("MM/DD/YYYY");
            var currentDate = $('<span>');
            currentDate.text(` (${currentCityDate}) `);
            cityName.append(currentDate);

            //Get weather icon and display          
            var currentCityWeatherIcon = data.current.weather[0].icon; // current weather icon
            var weatherIcon = $('<img>');
            weatherIcon.attr("src", "http://openweathermap.org/img/wn/" + currentCityWeatherIcon + ".png");
            cityName.append(weatherIcon);

            //Get current UV index, set background color based on level and display
            var currentCityUV = data.current.uvi;
            var currentUv = $('<p>');
            var currentUvColor = $('<span>');
            currentUv.append(currentUvColor);
            
            //Get current temp data and display
            var currentCityTemp = data.current.temp;
            var currentTemp = $('<p>')
            currentTemp.text(`Temp: ${currentCityTemp}°C`)
            currentCond.append(currentTemp);

            //Get current humidity and display
            var currentCityHumidity = data.current.humidity;
            var currentHumidity = $('<p>')
            currentHumidity.text(`Humidity: ${currentCityHumidity}%`)
            currentCond.append(currentHumidity);

            currentUvColor.text(`UV: ${currentCityUV}`)
            
            if ( currentCityUV < 3 ) {
                currentUvColor.css({'background-color':'green', 'color':'white'});
            } else if ( currentCityUV < 6 ) {
                currentUvColor.css({'background-color':'yellow', 'color':'black'});
            } else if ( currentCityUV < 8 ) {
                currentUvColor.css({'background-color':'orange', 'color':'white'});
            } else if ( currentCityUV < 11 ) {
                currentUvColor.css({'background-color':'red', 'color':'white'});
            } else {
                currentUvColor.css({'background-color':'violet', 'color':'white'});
            }

            currentCond.append(currentUv);

            //5 Day Forecast
            //create 5 Day Forecast <h2> header
            var fiveDayForecast = $('#fiveDayForecastHeader');
            var fiveDayHeaderEl = $('<h2>');
            fiveDayHeaderEl.text('5-Day Forecast:');
            fiveDayForecast.append(fiveDayHeaderEl);

            var fiveDayForecast = $('#fiveDayForecast');

            //Get key weather info from API data for five day forecast and display
            for (var i = 1; i <=5; i++) {
                var date;
                var temp;
                var icon;
                var wind;
                var humidity;

                date = data.daily[i].dt;
                date = moment.unix(date).format("MM/DD/YYYY");

                temp = data.daily[i].temp.day;
                icon = data.daily[i].weather[0].icon;
                wind = data.daily[i].wind_speed;
                humidity = data.daily[i].humidity;

                //Create a card
                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-primary', 'text-white');
                
                //Create card body and append
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = `<h6>${date}</h6>
                                      <img src= "http://openweathermap.org/img/wn/${icon}.png"> </><br>
                                       ${temp}°C<br>
                                       ${wind} KPH <br>
                                       ${humidity}%`
                
                card.appendChild(cardBody);
                fiveDayForecast.append(card);
            }
        })
    return;
}

//Display search history as buttons
function displayHistory() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    var pastSearchesEl = document.getElementById('past-searches');

    pastSearchesEl.innerHTML ='';

    for (i = 0; i < storedCities.length; i++) {
        
        var pastCityBtn = document.createElement("button");
        pastCityBtn.classList.add("btn", "btn-primary", "my-2", "past-city");
        pastCityBtn.setAttribute("style", "width: 100%");
        pastCityBtn.textContent = `${storedCities[i].city}`;
        pastSearchesEl.appendChild(pastCityBtn);
    }
    return;
}

//Use Open Weather 'Current weather data (API)' to get city coordinates to then send to 'One Call API' to get weather
function getCoordinates () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

    fetch(requestUrl)
      .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
          } else {
            throw Error(response.statusText);
          }
      })
      .then(function(data) {
 
        var cityInfo = {
            city: currentCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        storedCities.push(cityInfo);
        localStorage.setItem("cities", JSON.stringify(storedCities));

        displayHistory();

        return cityInfo;
      })
      .then(function (data) {
        getWeather(data);
      })
      return;
}

//Handle requst to clear past search history
function clearHistory (event) {
    event.preventDefault();
    var pastSearchesEl = document.getElementById('past-searches');

    localStorage.removeItem("cities");
    pastSearchesEl.innerHTML ='';

    return;
}

function clearCurrentCityWeather () {
    var currentCond = document.getElementById("currentConditions");
    currentCond.innerHTML = '';

    var fiveDayForecast = document.getElementById("fiveDayForecastHeader");
    fiveDayForecast.innerHTML = '';

    var fiveDayForecast = document.getElementById("fiveDayForecast");
    fiveDayForecast.innerHTML = '';

    return;
}

//Handle submit of city name by trimming and sending to getCoordinates function, clear HTML display of past weather data, cards, titles
function cityFormSubmit (event) {
    event.preventDefault();
    currentCity = city.val().trim();

    clearCurrentCityWeather();
    getCoordinates();

    return;
}

//When user clicks on city previously searched, an updated forecast will be retrieved and displayed
function pastCity (event) {
    var element = event.target;

    if (element.matches(".past-city")) {
        currentCity = element.textContent;
        
        clearCurrentCityWeather();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${APIkey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityInfo = {
                    city: currentCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityInfo;
            })
           .then(function (data) {
                getWeather(data);
        })
    }
    return;
}

displayHistory();

searchButton.on("click", cityFormSubmit);

clearButton.on("click", clearHistory);

pastCities.on("click", pastCity);