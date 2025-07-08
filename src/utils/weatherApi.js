const API_KEY = "b1fd6e14799699504191b6bdbcadfc35";
const API_URL_CURRENT = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
const API_URL_3HOURS = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric`;
// It calls the API from openweathermap

// Get the TODAY data
const weatherApi = {
  getTodayData(city) {
    //Get the CURRENT data
    //console.log(API_URL_CURRENT + "&q=" + city);
    return fetch(API_URL_CURRENT + "&q=" + city)
      .then(response => {
        return response.json();
      })
      .then(data => ({
        temp: parseInt(data.main.temp, 0),
        weatherDescription: data.weather[0].description,
        weatherIcon: this.getIconUrl(data.weather[0].icon),
        country: data.sys.country,
        timezone: data.timezone,
        time: this.formatDate(data.dt, data.timezone, "time"),
        weekday: this.formatDate(data.dt, data.timezone, "weekday"),
        city: data.name
      }))
      .catch(error => {
        return [];
      });
  },

  //Get the 3 hours data (forecast). The API sends 40 items on this array
  get3HoursData(city) {
    //console.log(API_URL_3HOURS + "&q=" + city);
    return fetch(API_URL_3HOURS + "&q=" + city)
      .then(response => {
        return response.json();
      })
      .then(data =>
        //Get only the first 8 results
        data.list.map(list => ({
          max: parseInt(list.main.temp_max, 0),
          min: parseInt(list.main.temp_min, 0),
          time: this.formatDate(list.dt, data.city.timezone, "time"),
          weekday: this.formatDate(list.dt, data.city.timezone, "weekday"),
          weather_icon: this.getIconUrl(list.weather[0].icon)
        }))
      )
      .catch(error => {
        return [];
      });
  },

  //Get the forecast for the next 5 days
  //Since the free api does not have a daily element.
  //This routine will parse the 3hrs forecast to pick the next 5 days.
  // and it finds the min and max temperature
  getWeeklyData(forecastWeekly) {
    var uniqueDay = [];

    forecastWeekly.map(element => {
      var isDuplicated = uniqueDay.hasOwnProperty(element.weekday);
      if (isDuplicated) {
        if (element.min < uniqueDay[element.weekday].min) {
          uniqueDay[element.weekday].min = element.min;
        }
        if (element.max > uniqueDay[element.weekday].max) {
          uniqueDay[element.weekday].max = element.max;
        }
      } else {
        uniqueDay[element.weekday] = element;
      }
    });
    //Return an array instead of object
    return Object.values(uniqueDay);
  },

  formatDate(utc, timezone, format) {
    //Parms:
    //  utc     : utc time in seconds
    //  timezone: timezone in seconds
    //  format  :
    //            - day: get the day of the month: 1,2,3,4...
    //            - time: get the time as am/pm: 1:00 am, 9:00 pm
    //            - weekday: get the long weekday name: Monday, Tuesday...
    /*
    console.log("Timezone: " + timezone);
    console.log("UTC: " + utc);
    console.log("Format: " + format);
    console.log("Sem timezone:  " + new Date(utc * 1e3).toISOString());
    console.log("Com timezone:  ", dt_timezone);
    console.log("*------------------------*");
    */
    //dt_timezone format: 2019-10-23T18:00:00.000Z

    const dt_timezone = new Date(utc * 1e3 + timezone * 1e3).toISOString();
    const dt = new Date(dt_timezone.substr(0, 19));
    if (format === "day") {
      return new dt.getDate();
    } else if (format === "time") {
      const hr = parseInt(dt_timezone.substr(11, 2), 0);
      if (hr === 12) {
        return "12pm";
      } else if (hr === 0) {
        return "12am";
      } else {
        return hr > 12 ? hr - 12 + "pm" : hr + "am";
      }
    } else if (format === "weekday") {
      return dt.toLocaleTimeString("en-us", { weekday: "long" }).split(" ")[0];
    }
  },

  getIconUrl(icon) {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
  }
};

export default weatherApi;
