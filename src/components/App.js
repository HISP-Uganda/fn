import "antd/dist/antd.css";
import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import IndicatorDetails from "./IndicatorDetails";
import Indicators from "./Indicators";

const App = () => {
  return (
    <Router>
      <div style={{ padding: 10 }}>
        <Switch>
          <Route path="/indicators/:id">
            <IndicatorDetails />
          </Route>
          <Route path="/">
            <Indicators />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
