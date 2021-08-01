import React, {Component} from 'react';
import {Container, Col, Row} from 'react-bootstrap';
import moment from 'moment';

class Forecast extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecastData: [],
            currentDate: moment().format("dddd, MMMM Do YYYY")
        };

        this.getClimaCellInfo = this.getClimaCellInfo.bind(this);
    }
    
    componentDidMount() {
        this.getForecast();
    }

    getForecast() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.getClimaCellInfo, this.handleGeoLocationError);
        } else { 
            alert("Geolocation is not supported by this browser.");
        }
    }

    handleGeoLocationError(error) {
        switch (error.code) {
            case 1: 
                alert("Location services have not been enabled in this browser. Please update your settings to enable location services.");
                break;
            default:
                alert(error.message);
        }
    }

    getClimaCellInfo = (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        fetch("https://api.climacell.co/v3/weather/forecast/hourly?lat=" + latitude + "&lon=" + longitude + 
        "&unit_system=us&start_time=now" + 
        "&fields=temp%2Cfeels_like%2Chumidity%2Cdewpoint%2Cbaro_pressure%2Cwind_speed%2Cprecipitation_type%2Cprecipitation_probability%2Cweather_code%2Cepa_health_concern%2Chail_binary%2Csunrise%2Csunset%2Cmoon_phase&apikey=8HqeuIlQTHf95chEFsP52mdK6xMUFnVa", {
            "method": "GET"
        })
        .then(response => response.json())
        .then(
            (result) => {
                for (let i = 0; i < result.length; i++) {
                    result[i].observation_date = moment(result[i].observation_time.value).format("dddd, MMMM Do YYYY");
                    result[i].observation_time = moment(result[i].observation_time.value).format("hA");
                };
                result = result.filter(x => x.observation_date === this.state.currentDate);
                this.setState({
                    forecastData: result
                });
                console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return(
            <Container className="text-align-center">
                <div className="header">Forecast My Run - {this.state.currentDate}</div>
                <Row>
                {this.state.forecastData.map((data, index) => (
                  <Col key={index} xs={6} sm={4} lg={3} className="forecast-item-container">
                        <div className="forecast-item">
                        <p>{data.observation_time}</p>
                        <p>Temperature: {Math.round(data.temp.value)}°{data.temp.units}</p>
                        {Math.round(data.feels_like.value) !== Math.round(data.temp.value) &&
                            <p>Feels Like: {Math.round(data.feels_like.value)}°{data.feels_like.units}</p>
                        }
                        <p>Humidity: {Math.round(data.humidity.value)}{data.humidity.units}</p>
                        <p>Dewpoint: {Math.round(data.dewpoint.value)}°{data.dewpoint.units}</p>
                        <p>{data.weather_code.value}</p>
                        <p>Wind Speed: {Math.round(data.wind_speed.value)}{data.wind_speed.units}</p>
                        {Math.round(data.baro_pressure.value) !== 30 &&
                            <p>Barometric Pressure: {Math.round(data.baro_pressure.value)}{data.baro_pressure.units}</p>
                        }
                        {data.precipitation_probability.value > 0 && data.precipitation_type.value !== 'none' &&
                            <p>Precipitation: {data.precipitation_probability.value}{data.precipitation_probability.units} {data.precipitation_type.value}</p>
                        }
                        {data.hail_binary === 1 &&
                            <p>Hail Possible</p>
                        }
                        {data.epa_health_concern.value !== 'Good' && data.epa_health_concern.value !== 'Moderate' &&
                            <p>EPA Health Concern: {data.epa_health_concern.value}</p>
                        }
                    </div>
                  </Col>
                ))}
                </Row>
            </Container>
        )
    }
}

export default Forecast;