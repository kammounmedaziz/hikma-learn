import React from "react";
import { Card } from "../../Components/ui/Card"; // Fixed import path
import GetGraph from "../GetGraph/GetGraph";
import WeeklyData from "../WeeklyData/WeeklyData";

class TodayData extends React.Component {
  render() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {this.props.city}, {this.props.country}
            </h2>
            <p className="text-gray-300">
              {this.props.weekday} {this.props.time}
            </p>
            <p className="text-gray-400">{this.props.weatherDescription}</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <img 
              src={this.props.weatherIcon} 
              alt="Weather icon" 
              className="w-16 h-16"
            />
            <span className="text-5xl font-bold text-white ml-2">
              {this.props.temp}
              <span className="text-xl align-top">°C</span>
            </span>

          </div>
        </div>
        
        <div className="mt-6">
          <GetGraph forecast3hrs={this.props.forecast3hrs} />
        </div>
        
        <div className="mt-8">
          <WeeklyData forecastWeekly={this.props.forecastWeekly} />
        </div>
      </div>
    );
  }
}

export default TodayData;

