import React from 'react';
import './App.scss';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: "10000",
      target: "2.00",
      date: new Date(),
      holidays: `January 1, 2020
January 20, 2020
February 17, 2020
April 10, 2020
May 25, 2020
July 3, 2020
September 7, 2020
November 26, 2020
November 27, 2020
December 24, 2020
December 25, 2020`
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeAmount = this.handleChangeAmount.bind(this);
    this.setStartDate = this.setStartDate.bind(this);
    this.generateTable = this.generateTable.bind(this);
    this.buildRows = this.buildRows.bind(this);
  }

  handleChange(event) {
    this.setState({target: event.target.value});
  }

  handleChangeAmount(event) {
    this.setState({amount: event.target.value});
  }

  buildRows() {
    const rows = [];

    const range = moment.range(this.state.date, '2020-12-31');
    const holidays = this.state.holidays.split("\n").map(d => {
      return moment(d).format('YYYY-MM-DD');
    })

    let target = parseFloat(this.state.amount);
    for (let day of range.by('day')) {
      const weekday = day.weekday();
      const format = day.format('YYYY-MM-DD');
      if (weekday !== 6 && weekday !== 6 && !holidays.includes(format)) {
        rows.push({date: format, target});

        target = target * (this.state.target / 100) + target
      }
    }

    return rows;
  }
  generateTable() {
    const rows = this.buildRows();
    this.setState({rows})
  }

  setStartDate(date) {
    this.setState({date});
  }

  render () {
    const rows = this.buildRows().map(row => (
      <tr key={row.date}>
        <td>{row.date}</td>
        <td>${numberWithCommas(row.target.toFixed(2))}</td>
      </tr>
    ))
    return (
      <div className="App">
        <h1>Investment Tracker</h1>

        <p>Because trading without a plan is for bozos.</p>
  
        <form onChange={this.generateTable}>
          <div>
            <label for="input-target">Amount:</label> <input id="input-target" value={this.state.amount} onChange={this.handleChangeAmount} type="text" />
          </div>
          <div>
            <label for="input-target">Target:</label> <input id="input-target" value={this.state.target} onChange={this.handleChange} type="text" />
          </div>
          <div>
            <label for="input-date">Start Date:</label> <DatePicker id="input-date" selected={this.state.date} onChange={date => this.setStartDate(date)} />
          </div>
          <div>
            <label for="input-holidays">Public Holidays (Default Nasdaq 2020):</label> <textarea id="input-holidays" rows="11" value={this.state.holidays} onChange={this.handleChangeHolidays} />
          </div>
        </form>
        <p>Trading days: {rows.length}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
  
        <small>Created by <a href="https://fivetwentysix.com">@fivetwentysix</a></small>
      </div>
    );
  }
  
}

export default App;
