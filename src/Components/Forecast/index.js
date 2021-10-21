import React, {Component} from 'react';
import {Container, Col, Row} from 'react-bootstrap';
import moment from 'moment';
import 'moment-timezone';
import queryString from 'querystring';
import fetch from "node-fetch";

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
        const getTimelineURL = "https://api.tomorrow.io/v4/timelines";
        const apikey = "xJD0RhzKbQOZlEWDhFrHXvYBZMt1Cqxh";
        let location = position.coords.latitude + "," + position.coords.longitude;
        const units = "imperial";
        const timesteps = ["current", "1h", "1d"];
        const startTime = moment().toISOString();
        const endTime = moment().add(1, "days").toISOString();
        const timezone = moment.tz.guess();

        const fields = [
            "precipitationIntensity",
            "precipitationType",
            "precipitationProbability",
            "windSpeed",
            "windGust",
            "temperature",
            "temperatureApparent",
            "dewPoint",
            "humidity",
            "weatherCode",
            "sunriseTime",
            "sunsetTime",
            "moonPhase",
            "uvIndex",
            "uvHealthConcern",
            "epaIndex",
            "epaPrimaryPollutant",
            "epaHealthConcern"
          ];


          const getTimelineParameters =  queryString.stringify({
            apikey,
            location,
            fields,
            units,
            timesteps,
            startTime,
            endTime,
            timezone,
        });        

        fetch(getTimelineURL + "?" + getTimelineParameters, {method: "GET"})
        .then((result) => result.json())
        .then((result) => {
            result = result.data.timelines;
            var formattedResult = [];

            for (let i = 0; i < result.length; i++) {
                if (result[i].timestep === "1h") {
                    formattedResult = result[i].intervals;
                    break;
                };
            };

            for (let i = 0; i < formattedResult.length; i++) {
                formattedResult[i].observation_date = moment(formattedResult[i].startTime).format("dddd, MMMM Do YYYY");
                formattedResult[i].observation_time = moment(formattedResult[i].startTime).format("hA"); 
            }

            console.log(formattedResult);

            formattedResult = formattedResult.filter(x => x.observation_date === this.state.currentDate);

            this.setState({
                forecastData: formattedResult
            });
    })
        .catch((error) => console.error("error: " + error));
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
                        <p>Temperature: {Math.round(data.values.temperature)}°F</p>
                        {Math.round(data.values.temperatureApparent) !== Math.round(data.values.temperature) &&
                            <p>Feels Like: {Math.round(data.values.temperatureApparent)}°F</p>
                        }
                        <p>Humidity: {Math.round(data.values.humidity)}%</p>
                        <p>Dewpoint: {Math.round(data.values.dewPoint)}°F</p>
                    </div>
                  </Col>
                ))}
                </Row>
            </Container>
        )
    }
}

export default Forecast;