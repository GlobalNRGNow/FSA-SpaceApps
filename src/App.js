import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Route path = '/about' component={About} />
    </div>
  );
}

export default App;
