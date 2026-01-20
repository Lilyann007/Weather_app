import React,{ useEffect, useState }  from "react";
import "./App.css";

export default function WeatherApp(){
  const [weather,setWeather] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const [city,setCity] = useState("Tokyo");

  //组件加载时获取默认城市天气
  useEffect(() => {fetchWeather("Tokyo")},[]);

  // 🔑 核心功能：获取天气数据
  const fetchWeather = async(cityName) => {
    setLoading(true);
    setError(null);

    try {
      // 第一步：通过城市名获取经纬度
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=zh&format=json`);
      const geoData = await geoResponse.json();

      if(!geoData.results || geoData.results.length === 0){
        throw new Error("找不到这个城市");
      }
      const {latitude,longitude,name,country} = geoData.results[0];
      
      // 第二步：通过经纬度获取天气
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&current=temperature_2m,wind_speed_10m,weather_code,relative_humidity_2m&timezone=auto`);
      
      const weatherData = await weatherResponse.json();

      // 👉 按照你设计的数据结构组装
      const weatherObj = {
        city:name,
        temperature:Math.round(weatherData.current.temperature_2m),
        humidity:weatherData.current.relative_humidity_2m,
        windSpeed:weatherData.current.wind_speed_10m,
        max_temp:Math.round(weatherData.daily.temperature_2m_max[0]), // 注意：daily 数据是数组，取第一项 [0] 代表今天
        min_temp:Math.round(weatherData.daily.temperature_2m_min[0]),
      }
      setWeather(weatherObj);
    } catch (err) {
      setError(err.message || "获取天气失败，请重试");
      console.log("天气获取失败：",err);
    }finally{
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if(city.trim()){
      fetchWeather(city);
    }
  };

  return(
    <div className="container">
      
      <div className="header"><h1>☀️天気予報</h1></div>
      
      <form onSubmit={handleSearch} className="search-section">
          <input
            type="text" 
            className="weather-search" 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            placeholder="请输入城市名（按回车搜索）" 
          />
          <button className="search-btn" type="submit" disabled={loading}>
            {loading? "検索中..." : "検索"}
          </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>正在获取天气数据……</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {!loading && !error && weather && (
        <div className="weather-content">
        <div>
          <h2>{weather.city}</h2>
          <p>気温：{weather.temperature}°C</p>
          <p>最高気温：{weather.max_temp}°C</p>
          <p>最低気温：{weather.min_temp}°C</p>
          <p>湿度：{weather.humidity}%</p>
          <p>風速：{weather.windSpeed}kmh</p>
        </div>
      </div>
      )}
    </div>
  )
}