import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
   // Link
  } from "react-router-dom";
import App from './App.js';
import Home from './Home.js';

function Routes() {
    return(
        <Router>
            <Switch>
                <Route path = "/" exact component = {Home}></Route>
                <Route path = "/chat" component = {App}></Route>
            </Switch>
        </Router>
        
    )
}

export default Routes;