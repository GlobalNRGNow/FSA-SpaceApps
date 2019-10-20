import React from 'react';

class SolarCalc extends React.Component {
    constructor() {
        super();
      const panel = this.props.DCSize
        this.state = {
            production: 0,
            panelArea: panel,
            performanceRatio: .35,
            costPerWatt: 1.6,
            utilityCostPerKwH: 0.20,
            totalSystemCost: 0,
            breakEven: 0,
            payoffDate:''
        }
    }

calcSolarProduction (){
  const energy =  this.state.solarRadiation
                * (this.state.panelArea/25)
                * this.state.performanceRatio
  this.setState({energy: energy})
}

calcSolarBreakEven(){
  const breakEven =  this.state.totalSystemCost /
                  (this.state.utilityCostPerKwH * this.state.production)
  this.setState({breakEven: breakEven})
}

calcSolarCosts (){
  const costs = this.state.production * this.state.costPerWatt
  this.setState({totalSystemCost:costs})
}

calcSolarPayoffDate(){
  const years = Math.floor(this.state.breakEven)
  const months = Math.ceil(12/(this.state.breakEven - years))
  const yearsString = years > 1? 'years':'year'
  const monthsString = months > 1? 'months':'month'
  const SolarPayoffDate = `${2} ${yearsString} and ${months} ${monthsString}`
  this.setState({payoffDate:SolarPayoffDate})
}
async componentDidMount () {
  this.state.calcSolarProduction ()
  this.state.calcSolarBreakEven()
  this.state.calcSolarCosts ()
  this.state.calcSolarPayoffDate()
}

render () {
  return (
    <div>
      <p>Your break even: {this.state.breakEven}</p>
      <p>You'll pay off your solar by: {this.state.SolarPayoffDate}</p>
      <p>Your total system cost is: {this.state.totalSystemCost}</p>
      <p>Your production is: {this.state.production}</p>
    </div>
  )
}


}

export default SolarCalc
