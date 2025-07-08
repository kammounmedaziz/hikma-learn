import React, { Component } from "react";
import weatherApi from "../../utils/weatherApi";
import SearchBar from "../SearchBar/SearchBar";
import TodayData from "../TodayData/TodayData";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTime: true,
      city: "",
      weekday: "",
      temp: "",
      weatherDescription: "",
      weatherIcon: "",
      country: "",
      timezone: "",
      time: "",
      forecast3hrs: [],
      forecastWeekly: []
    };
    this.search = this.search.bind(this);
  }

  updateTodayState = data => {
    this.setState({
      firstTime: false,
      temp: data.temp,
      weatherDescription: data.weatherDescription,
      weatherIcon: data.weatherIcon,
      country: data.country,
      timezone: data.timezone,
      dateTime: data.dateTime,
      time: data.time,
      weekday: data.weekday,
      city: data.city
    });
  };

  updateWeeklyState = data => {
    this.setState({
      forecastWeekly: data,
      forecast3hrs: data.slice(0, 8)
    });
  };

  search(term) {
    weatherApi.getTodayData(term).then(data => this.updateTodayState(data));
    weatherApi.get3HoursData(term).then(data => this.updateWeeklyState(data));
  }

  warningBanner() {
    if (this.state.firstTime) return null;

    return (
      <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-600 rounded-lg text-center shadow-md">
        We couldn’t find any results. Try checking your spelling.
      </div>
    );
  }

  displayResult() {
    return this.state.city !== undefined && this.state.city !== "";
  }

  render() {
    return (
      <div className="min-h-screen  text-white px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-500 text-transparent bg-clip-text">
              Weather App
            </h1>
          </header>

          <SearchBar onSearch={this.search} updateTerm={this.updateTerm} />

          {this.displayResult() ? (
            <TodayData
              city={this.state.city}
              country={this.state.country}
              temp={this.state.temp}
              time={this.state.time}
              weekday={this.state.weekday}
              weatherDescription={this.state.weatherDescription}
              weatherIcon={this.state.weatherIcon}
              forecast3hrs={this.state.forecast3hrs}
              forecastWeekly={this.state.forecastWeekly}
            />
          ) : (
            this.warningBanner()
          )}
        </div>
      </div>
    );
  }
}

export default App;
