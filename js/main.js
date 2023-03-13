$(document).ready(function($) {
    console.log('Hello human ;)');

    async function getEnv() {
        let envUrl = 'env.json';
        try {
            let apiKey = await fetch(envUrl);
            return await apiKey.json();
        } catch (error) {
            console.log(error);
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeather, showError);
    } else {
        console.log('Geolocation is not supported by this browser.');
    }

    function showError(error) {
        console.log(error.message);
        console.log('Get Geolocation over IP Address');
        getGeoByIP();
    }

    async function getWeather(position) {

        console.log('Geolocalisation successful');
        console.log('Latitude: ' + position.coords.latitude);
        console.log('Longitude: ' + position.coords.longitude);

        let env = await getEnv();
        var lat = 'lat=' + position.coords.latitude,
            lon = 'lon=' + position.coords.longitude,
            lang = 'lang=de',
            units = 'units=metric',
            weatherAPI = lat + '&'  + lon + '&'  + lang + '&'  + units  + '&appid='  + env.owmApiKey;

        loadOSM(env.owmApiKey, position);

        const xhttp = new XMLHttpRequest();

        xhttp.onload = function() {

            const weatherJSON = JSON.parse(this.response);

            var yesnoReturn = JSON.parse(getMeme(weatherJSON.main.temp)),
                yes = ['Ja', 'Jo', 'Jap', 'Oh ja', 'jawohl', 'freilich', 'auf jeden'],
                no = ['Nein', 'No', 'Neee', 'Naaa', 'Nop', 'keinesfalls', 'Nö'];

            $('.header').css('background-image', 'url(' + yesnoReturn.image + ')');

            switch (yesnoReturn.answer) {
                case 'yes':
                    var randYes = yes[(Math.random() * yes.length) | 0];
                    yesnoReturn.answer = randYes;
                    break;
                case 'no':
                    var randNo = no[(Math.random() * no.length) | 0];
                    yesnoReturn.answer = randNo;
                    break;
                default:
                    yesnoReturn.answer = 'vielleicht';
            }

            $('.header span').text(yesnoReturn.answer);

            getMeme(weatherJSON.main.temp);

            $('.date_today').html('Wetter in ' + weatherJSON.name +'<br>' + getDateFormat(weatherJSON.dt, weatherJSON.timezone, weatherJSON.sys.country));
            $('.weather_today span:nth-child(2)').html('<img src="https://openweathermap.org/img/wn/' + weatherJSON.weather[0].icon + '@2x.png">');
            $('.weather_today span:nth-child(1)').html(weatherJSON.main.temp + '°<small>' + weatherJSON.weather[0].description + '</small>');

            $('.feels_like').append(weatherJSON.main.feels_like + '°');
            $('.temp_max').append(weatherJSON.main.temp_max + '°');
            $('.temp_min').append(weatherJSON.main.temp_min + '°');
            $('.humidity').append(weatherJSON.main.humidity + ' %');

            $('.sunrise').append(getTimeFormat(weatherJSON.sys.sunrise, weatherJSON.timezone, weatherJSON.sys.country));
            $('.sunset').append(getTimeFormat(weatherJSON.sys.sunset, weatherJSON.timezone, weatherJSON.sys.country));
            $('.wind_speed').append(parseInt(weatherJSON.wind.speed) * parseInt(3.6) + ' km/h');
            $('.wind_deg').append(weatherJSON.wind.deg + '°');

            $('.pollen_button a').attr('href', 'https://www.wetteronline.de/pollenvorhersage?gid=10471&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude);

            getWeatherForcast(weatherAPI, getDateFormat(weatherJSON.dt, weatherJSON.timezone, weatherJSON.sys.country));

        };

        xhttp.open('GET', 'https://api.openweathermap.org/data/2.5/weather?' + weatherAPI, false);
        xhttp.send();

    }

    function getMeme(temp) {
        const xhttp = new XMLHttpRequest();

        if (temp <= 8) {
            var yesno = 'force=no';
        }
        else {
            var yesno = 'force=yes';
        }

        xhttp.open('GET', 'https://yesno.wtf/api?' + yesno, false);
        xhttp.send();

        return xhttp.response;
    }

    function getDateFormat(timestamp, timezone, country) {
        var getDate = new Date(timestamp * 1000 - (timezone * 1000)).toLocaleString(country, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
        return getDate;
    }

    function getTimeFormat(timestamp, timezone, country) {
        var getTime = new Date(timestamp * 1000 - (timezone * 1000)).toLocaleTimeString(country, { hour12: false });
        return getTime;
    }

    async function getGeoByIP() {
        const xhttp = new XMLHttpRequest();

        let env = await getEnv();

        xhttp.open('GET', 'https://ipinfo.io/?token=' + env.ipApiKey, false);
        xhttp.send();

        var userIP = JSON.parse(xhttp.response).loc.split(','),
            position = '{"coords": {"latitude": "' + userIP[0] + '","longitude": "' + userIP[1] + '"}}';

        getWeather(JSON.parse(position));
    }

    function getWeatherForcast(weatherAPI, todayDate) {
        const xhttp = new XMLHttpRequest();

        xhttp.onload = function() {

            const forecastJSON = JSON.parse(this.response);

            forecastJSON.list.forEach(function (item, index, arr) {
                var forcastDate = getDateFormat(item.dt, forecastJSON.city.timezone, forecastJSON.city.country),
                    forcastTime = getTimeFormat(item.dt, forecastJSON.city.timezone, forecastJSON.city.country).split(':');

                if (forcastDate == todayDate) {

                    var forcastTime = forcastTime[0] + ':' + forcastTime[1],
                        forcastDT = item.dt,
                        tabID = index,
                        forcastCheck = 'checked="checked"',
                        rainPop = item.pop * 100,
                        windSpeed = parseInt(item.wind.speed) * parseInt(3.6);

                    if (index > 0) {
                        forcastCheck = '';
                    }

                    let forcastInput = `<input ${forcastCheck} id="tab${forcastDT}" class="tab${tabID}" type="radio" name="tabs" />`;
                    let forcastButton = `<label for="tab${forcastDT}" class="button button-primary tab${tabID}">${forcastTime}<div class="forcast_icon" style="background-image: url(https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png)"></div>${item.main.temp}°</label>`;

                    let forcastData = `<div class="tab${forcastDT} tab${tabID}"><div class="row text-center weather_forcast_main"><div class="four columns temp"><strong>Temperatur</strong>${item.main.temp}°</div><div class="four columns description"><strong>${item.weather[0].description}</strong><div class="forcast_icon" style="background-image: url(https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png)"></div></div><div class="four columns rain_pop"><strong>Regenwahrscheinlichkeit</strong>${rainPop} %</div></div><hr class="u-full-width"><div class="row text-center weather_forcast_main"><div class="four columns humidity"><strong>Feuchtigkeit</strong>${item.main.humidity} %</div><div class="four columns wind_speed"><strong>Windgeschwindigkeit</strong>${windSpeed} km/h</div><div class="four columns column wind_deg"><strong>Windrichtung</strong>${item.wind.deg}°</div></div></div>`;

                    $('.weather_forcast .tabbed').prepend(forcastInput);
                    $('.weather_forcast .tab_buttons').append(forcastButton);
                    $('.weather_forcast figure').append(forcastData);
                }
            });

        };

        xhttp.open('GET', 'https://api.openweathermap.org/data/2.5/forecast?cnt=8&' + weatherAPI, false);
        xhttp.send();
    }

    function loadOSM(OWM_API_KEY, position) {

        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
        });

        var precipitationcls = L.OWM.precipitationClassic({opacity: 0.7, appId: OWM_API_KEY});
        var cloudscls = L.OWM.cloudsClassic({opacity: 0.7, appId: OWM_API_KEY});
        var snow = L.OWM.snow({opacity: 0.7, appId: OWM_API_KEY});
        var pressurecntr = L.OWM.pressureContour({opacity: 0.5, appId: OWM_API_KEY});
        var temp = L.OWM.temperature({opacity: 0.5, appId: OWM_API_KEY});
        var wind = L.OWM.wind({opacity: 0.5, appId: OWM_API_KEY});

        var map = L.map('map', {
            center: new L.LatLng(position.coords.latitude, position.coords.longitude),
            zoom: 8,
            scrollWheelZoom: false,
            layers: [osm]
        });

        var customIcon = L.icon({
            iconUrl: 'images/mapicon.png',
            iconSize: [30, 30]
        });

        var marker = new L.Marker([position.coords.latitude, position.coords.longitude], {icon: customIcon});

        var overlayMaps = {
            "Niederschlag": precipitationcls,
            "Wolken": cloudscls,
            "Schnee": snow,
            "Luftdruck": pressurecntr,
            "Temperatur": temp,
            "Wind": wind
        };

        var layerControl = L.control.layers(overlayMaps).addTo(map);

        map.addLayer(precipitationcls);
        marker.bindPopup('Das bist du!');
        marker.addTo(map);
    }
});