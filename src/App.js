import React from 'react';
import './App.scss';
import DatePicker from 'react-datepicker';
import Moment from 'moment';
import json2csv from 'json2csv';
import { extendMoment } from 'moment-range';
import { CSVLink } from "react-csv";
const moment = extendMoment(Moment);

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class App extends React.Component {
  constructor(props) {
    super(props);
    let date = moment().startOf('year').toDate();
    let endDate = moment().endOf('year').toDate();

    if (localStorage['date']) {
      date = moment(localStorage['date']).toDate();
    }

    if (localStorage['endDate']) {
      endDate = moment(localStorage['endDate']).toDate();
    }

    this.state = {
      amount: localStorage['amount'] || "10000",
      target: localStorage['target'] || "2.00",
      date,
      endDate,
      holidays: localStorage['holidays'] || `January 1, 2020
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
    this.handleChangeHolidays = this.handleChangeHolidays.bind(this);
    this.setStartDate = this.setStartDate.bind(this);
    this.setEndDate = this.setEndDate.bind(this);
    this.generateTable = this.generateTable.bind(this);
    this.buildRows = this.buildRows.bind(this);
  }

  handleChange(event) {
    this.setState({target: event.target.value});
  }

  handleChangeAmount(event) {
    this.setState({amount: event.target.value});
  }

  handleChangeHolidays(event) {
    this.setState({holidays: event.target.value});
  }

  buildRows() {
    const rows = [];

    const range = moment.range(this.state.date, this.state.endDate);
    const holidays = this.state.holidays.split("\n").map(d => {
      return moment(d).format('YYYY-MM-DD');
    })
    let target = parseFloat(this.state.amount);
    let previous = target;

    for (let day of range.by('day')) {
      const weekday = day.weekday();
      const format = day.format('YYYY-MM-DD');
      if (weekday !== 6 && weekday !== 0 && !holidays.includes(format)) {
        const gain = target - previous;
        rows.push({date: format, target, gain});

        previous = target
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

  setEndDate(endDate) {
    this.setState({endDate});
  }

  render () {
    const data = this.buildRows();
    const rows = data.map(row => (
      <tr key={row.date}>
        <td>{row.date}</td>
        <td>${numberWithCommas(row.target.toFixed(2))}</td>
        <td>${numberWithCommas(row.gain.toFixed(2))}</td>
      </tr>
    ));
    const csvData = json2csv.parse(data);
    
    // Save state to localStorage
    for (const key in this.state) {
      if (this.state.hasOwnProperty(key)) {
        localStorage[key] = this.state[key];
      }
    }
    return (
      <div className="App">
        <h1>Investment Target Tracker</h1>
        
        <form onChange={this.generateTable}>
          <div>
            <label htmlFor="input-target">Amount:</label> <input id="input-target" value={this.state.amount} onChange={this.handleChangeAmount} type="text" />
          </div>
          <div>
            <label htmlFor="input-target">Target % Daily Gain:</label> <input id="input-target" value={this.state.target} onChange={this.handleChange} type="text" />
          </div>
          <div>
            <label htmlFor="input-date">Start Date:</label> <DatePicker id="input-date" selected={this.state.date} onChange={date => this.setStartDate(date)} />
          </div>
          <div>
            <label htmlFor="input-enddate">End Date:</label> <DatePicker id="input-date" selected={this.state.endDate} onChange={date => this.setEndDate(date)} />
          </div>
          <div>
            <label htmlFor="input-holidays">Public Holidays (Default Nasdaq 2020):</label> <textarea id="input-holidays" rows="11" value={this.state.holidays} onChange={this.handleChangeHolidays} />
          </div>
        </form>
        <p>Trading days: {rows.length}</p>

        <CSVLink data={csvData}>Download CSV</CSVLink>       

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Target</th>
              <th>Gain Required</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
