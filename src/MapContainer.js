
import React, { Component } from 'react'
import Sidebar from './Sidebar'
import Slider from './Services/SolarRad/Slider'
import SolarCalc from './Views/SolarCalc'
import axios from 'axios'
const mapboxgl = require("mapbox-gl");


mapboxgl.accessToken = 'pk.eyJ1IjoiYmtrZW56byIsImEiOiJjazE2a3k2bzYwNjVzM2Jsamw1MTgzbjZyIn0.nqQe3v1udmc5ScIgbdLOZA'

export default class MapContainer extends Component {

  map = {
    currLat: 10000, currLong: 1235
  }

  constructor(){
    super()

    this.state = {
        currLat: 10000, 
        currLong: 1235, 
        x: 10000, 
        y: 10000,
        production: 0,
        solarRadiation: 4,
        panelArea: 0,
        performanceRatio: .35,
        costPerWatt: 1.6,
        utilityCostPerKwH: 0.20,
        totalSystemCost: 0,
        breakEven: 0,
        payoffDate: ''
    }
    this.clickhandler = this.clickhandler.bind(this)
  }

        async calcSolarProduction() {
                const energy = this.state.solarRadiation
                        * (this.state.panelArea / 25)
                        * this.state.performanceRatio
                await this.setState({ production: energy })
        }

        async calcSolarBreakEven() {
                const breakEven = this.state.totalSystemCost /
                        (this.state.utilityCostPerKwH * this.state.production)
                await this.setState({ breakEven: breakEven })
        }

        async calcSolarCosts() {
                const costs = this.state.production * this.state.costPerWatt
                await this.setState({ totalSystemCost: Math.round(costs) })
        }

        async calcSolarPayoffDate() {
                const years = Math.floor(this.state.breakEven)
                const months = Math.ceil(12 * (this.state.breakEven - years))
                const yearsString = years > 1 ? 'years' : 'year'
                const monthsString = months > 1 ? 'months' : 'month'
                const SolarPayoffDate = `${years} ${yearsString} and ${months} ${monthsString}`
               await this.setState({ payoffDate: SolarPayoffDate })
        }
        async componentDidMount() {
                this.map = new mapboxgl.Map({
                        container: "map",
                        center: [-121.22761999688527, 36.499936250632544], // FullStack NY coordinates; alternatively, use [-87.6354, 41.8885] for Chicago
                        zoom: 5, // starting zoom
                        style: "mapbox://styles/mapbox/streets-v10" // mapbox has lots of different map styles available.
                });

                this.map.on('mousedown', (e) => {
                        const data = e.lngLat.wrap()
                        this.map.currLong = data.lng
                        this.map.currLat = data.lat
                });

                this.map.on('load', function () {
                        // Add a geojson point source.
                        // Heatmap layers also work with a vector tile source.
                        this.addSource('earthquakes', {
                                "type": "geojson",
                                "data": "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
                        });

                        this.addLayer({
                                "id": "earthquakes-heat",
                                "type": "heatmap",
                                "source": "earthquakes",
                                "maxzoom": 9,
                                "paint": {
                                        // Increase the heatmap weight based on frequency and property magnitude
                                        "heatmap-weight": [
                                                "interpolate",
                                                ["linear"],
                                                ["get", "mag"],
                                                0, 0,
                                                6, 1
                                        ],
                                        // Increase the heatmap color weight weight by zoom level
                                        // heatmap-intensity is a multiplier on top of heatmap-weight
                                        "heatmap-intensity": [
                                                "interpolate",
                                                ["linear"],
                                                ["zoom"],
                                                0, 1,
                                                9, 3
                                        ],
                                        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                                        // Begin color ramp at 0-stop with a 0-transparancy color
                                        // to create a blur-like effect.
                                        "heatmap-color": [
                                                "interpolate",
                                                ["linear"],
                                                ["heatmap-density"],
                                                0, "rgba(33,102,172,0)",
                                                0.2, "rgb(103,169,207)",
                                                0.4, "rgb(209,229,240)",
                                                0.6, "rgb(253,219,199)",
                                                0.8, "rgb(239,138,98)",
                                                1, "rgb(178,24,43)"
                                        ],
                                        // Adjust the heatmap radius by zoom level
                                        "heatmap-radius": [
                                                "interpolate",
                                                ["linear"],
                                                ["zoom"],
                                                0, 2,
                                                9, 20
                                        ],
                                        // Transition from heatmap to circle layer by zoom level
                                        "heatmap-opacity": [
                                                "interpolate",
                                                ["linear"],
                                                ["zoom"],
                                                7, 1,
                                                9, 0
                                        ],
                                }
                        }, 'waterway-label');

                        this.addLayer({
                                "id": "earthquakes-point",
                                "type": "circle",
                                "source": "earthquakes",
                                "minzoom": 7,
                                "paint": {
                                        // Size circle radius by earthquake magnitude and zoom level
                                        "circle-radius": [
                                                "interpolate",
                                                ["linear"],
                                                ["zoom"],
                                                7, [
                                                        "interpolate",
                                                        ["linear"],
                                                        ["get", "mag"],
                                                        1, 1,
                                                        6, 4
                                                ],
                                                16, [
                                                        "interpolate",
                                                        ["linear"],
                                                        ["get", "mag"],
                                                        1, 5,
                                                        6, 50
                                                ]
                                        ],
                                        // Color circle by earthquake magnitude
                                        "circle-color": [
                                                "interpolate",
                                                ["linear"],
                                                ["get", "mag"],
                                                1, "rgba(33,102,172,0)",
                                                2, "rgb(103,169,207)",
                                                3, "rgb(209,229,240)",
                                                4, "rgb(253,219,199)",
                                                5, "rgb(239,138,98)",
                                                6, "rgb(178,24,43)"
                                        ],
                                        "circle-stroke-color": "white",
                                        "circle-stroke-width": 1,
                                        // Transition from heatmap to circle layer by zoom level
                                        "circle-opacity": [
                                                "interpolate",
                                                ["linear"],
                                                ["zoom"],
                                                7, 0,
                                                8, 1
                                        ]
                                }
                        }, 'waterway-label');
                });

        }


  async clickhandler() {
    this.setState({
      currLat: this.map.currLat,
      currLong: this.map.currLong
    })
    const solarResponse = await axios.get('https://developer.nrel.gov/api/pvwatts/v6.json?api_key=GDegXZpZdwcvtgRxy4bovbrVtN6NbLTV9UDBpRyo&lat=40.7698823&lon=-73.9656831&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10')
    this.setState({ solarData: solarResponse.data, panelArea: 7000 })
       await this.calcSolarProduction()
          await this.calcSolarCosts()
       await  this.calcSolarBreakEven()
       await this.calcSolarPayoffDate()

  }

  render() {
    console.log("what happens",this.map.currLat)
    return (
      <div>
        {/* <Slider
          axis="x"
          x={this.state.x}
          xmax={10000}
          onChange={({ x }) => this.setState(state => ({ ...state, x }))}
        /> */}
        <div className='sidebar'>
                <div>
                        <p>You are here: Lon: {this.state.currLong}, Lat: {this.state.currLat}</p>
                        <p>Your break even: {this.state.breakEven}</p>
                        <p>You'll pay off your solar by: {this.state.payoffDate}</p>
                        <p>Your total system cost is: ${this.state.totalSystemCost}</p>
                        <p>Your production is: {this.state.production} kW</p>
                </div>
        </div>
        <div id="map" onClick={this.clickhandler}>
        </div>

  
      </div>
    )
  }


}


