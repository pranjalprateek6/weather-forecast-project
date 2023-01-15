function getFormatTime(dt) {
    let dateObj = new Date(dt * 1000);
    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes();

    let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return timeString;
}

function getCurrentDay(dt, length = 'full') {
    let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let dateObj = new Date(dt * 1000);

    let currentDay = days[dateObj.getDay()];
    if (length === 'full') {
        return ucFirst(currentDay);
    } else {
        return ucFirst(currentDay.slice(0, length));
    }
}

function getCurrentDate(dt, separator) {
    let month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'septemper', 'october', 'november', 'december']
    let dateObj = new Date(dt * 1000);

    let currentDate = dateObj.getDate();
    let currentMonth = month[dateObj.getMonth()];

    return `${currentDate}${separator}${ucFirst(currentMonth)}`;
}

function ucFirst(str) {
    if (!str) return str;

    return str[0].toUpperCase() + str.slice(1);
}

function printHoursForecast(array, timezone) {
    let output = document.querySelectorAll('.hour-block');
    for (let i = 0; i < output.length; i++) {
        output[i].children[0].innerHTML = `<img src="https://openweathermap.org/img/wn/${array[i].weather[0].icon}.png" alt="Weather icon">`;
        output[i].children[1].innerHTML = Math.round(array[i].temp - 273.15) + '&deg;';
        output[i].children[2].textContent = getFormatTime(array[i].dt + timezone);
    }
}

function printDailyForecast(array, timezone) {
    let output = document.querySelectorAll('.week-wrapper');
    for (let i = 0; i < output.length; i++) {
        output[i].children[0].children[0].textContent = getCurrentDay((array[i].dt + timezone), 3).toUpperCase();
        output[i].children[0].children[1].textContent = getCurrentDate((array[i].dt + timezone), ' ');
        output[i].children[1].children[0].innerHTML = Math.round(array[i].temp.max - 273.15) + '&deg;';
        output[i].children[1].children[1].innerHTML = Math.round(array[i].temp.min - 273.15) + '&deg;';
        output[i].children[2].children[0].innerHTML = `<img src="https://openweathermap.org/img/wn/${array[i].weather[0].icon}.png" alt="Weather icon">`;
        output[i].children[2].children[1].textContent = ucFirst(array[i].weather[0].description);
    }
}

function sunMovement(sunrise, sunset) {
    let now = Math.floor((new Date()).getTime() / 1000);

    if (sunrise < now && now < sunset) {
        let diff = Math.round(((now) - sunrise) / (sunset - sunrise) * 100);
        document.querySelector('.sun-icon').style.left = `${diff}%`;
        document.querySelector('.sun-icon').style.transform = `translateX(-${diff}%)`;
        if (diff < 50) {
            document.querySelector('.sun-icon').style.bottom = `${diff}px`;
        } else {
            document.querySelector('.sun-icon').style.bottom = `${100-diff}px`;
        }
    } else {
        document.querySelector('.sun-icon').classList.add('hidden');
    }

}

function showWeather() {
    let url = '';
    const apiKey = "49cc8c821cd2aff9af04c9f98c36eb74";
    if (arguments.length === 1) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${arguments[0]}&appid=${apiKey}`
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${arguments[0]}&lon=${arguments[1]}&appid=${apiKey}`
    }
    fetch(url)
        .then(function(resp) {
            return resp.json()
        })
        .then(function(data) {

            document.querySelector('.city-name').textContent = `${data.name}, ${data.sys.country}`;
            document.querySelector('.date').textContent = `${getCurrentDay(data.dt)}, ${getCurrentDate((data.dt), ' ')}`;
            document.querySelector('.main-temp').innerHTML = Math.round(data.main.temp - 273.15) + '&deg;';
            document.querySelector('.condition').textContent = data.weather[0]['description'];
            document.querySelector('.icon-big').innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0]['icon']}@2x.png" alt="Weather icon">`;
            document.querySelector('#pressure').textContent = Math.round(data.main.pressure / 1.333) + 'mmHg';
            document.querySelector('#humidity').textContent = data.main.humidity + '%';
            document.querySelector('#wind').textContent = data.wind.speed + ' m/s';
            document.querySelector('#sunrise').textContent = getFormatTime(data.sys.sunrise + data.timezone);
            document.querySelector('#sunset').textContent = getFormatTime(data.sys.sunset + data.timezone);
            sunMovement(data.sys.sunrise, data.sys.sunset);

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=current&appid=${apiKey}`)
                .then(function(resp) {
                    return resp.json()
                })
                .then(function(data) {

                    printHoursForecast(data.hourly, data.timezone_offset);
                    printDailyForecast(data.daily, data.timezone_offset);
                    document.querySelector('.result').classList.remove('hidden');
                    document.querySelector('.loading').classList.add('hidden');
                    document.querySelector('.wrapper').classList.remove('error');
                })
                .catch(function(error) {

                });
        })
        .catch(function(error) {

            document.querySelector('.loading').classList.add('hidden');
            document.querySelector('.wrapper').classList.add('error');
        });

}

document.querySelector('.search__button').onclick = function(e) {
    e.preventDefault();
    document.querySelector('.result').classList.add('hidden');
    let input = document.querySelector('.search__input');
    if (input.value) {
        input.style.border = '1px dashed #303030';
        showWeather(input.value);
        input.value = '';
        document.querySelector('.loading').classList.remove('hidden');
        this.disabled = false;
    } else {
        input.style.border = '1px dashed red';
        this.disabled = false;
    }
}
document.querySelector('.geo__button').onclick = function(e) {
    e.preventDefault();
    document.querySelector('.loading').classList.remove('hidden');

    function success(pos) {
        var crd = pos.coords;
        showWeather(crd.latitude, crd.longitude);
    };

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        document.querySelector('.loading').classList.add('hidden');
    };

    navigator.geolocation.getCurrentPosition(success, error);
}
document.addEventListener('click', function(event) {
    if (!event.target.closest('.change-view')) return;
    document.querySelector('.right-block').classList.toggle('active');
    document.querySelector('.left-block').classList.toggle('hidden');
});