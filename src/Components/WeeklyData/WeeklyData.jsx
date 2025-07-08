import React from "react";
import weatherApi from "../../utils/weatherApi";

class WeeklyData extends React.Component {
  constructor(props) {
    super(props);
    this.getWeeklyData = this.getWeeklyData.bind(this);
  }

  getWeeklyData(forecastWeekly) {
    return weatherApi.getWeeklyData(forecastWeekly);
  }

  render() {
    const weeklyData = this.getWeeklyData(this.props.forecastWeekly);
    return (
      <div className="overflow-x-auto py-4">
        <div className="flex space-x-8 min-w-max justify-center">
          {weeklyData.map(forecast => (
            <div 
              key={forecast.weekday} 
              className="flex flex-col items-center bg-gradient-to-b from-indigo-700 via-indigo-900 to-black rounded-lg p-4 shadow-md min-w-[80px]"
            >
              <p className="text-sm text-indigo-300 font-semibold mb-1">
                {forecast.weekday}
              </p>
              <img 
                src={forecast.weather_icon} 
                alt={`${forecast.weekday} weather icon`} 
                className="w-12 h-12 mb-2"
              />
              <p className="text-white font-medium text-base">
                <span className="text-red-400">{forecast.max}°</span> |{" "}
                <span className="text-blue-400">{forecast.min}°</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default WeeklyData;
