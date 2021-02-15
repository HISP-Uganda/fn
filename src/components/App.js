import "antd/dist/antd.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Indicators from "./Indicators";
import IndicatorUpdate from "./IndicatorUpdate";
import NewIndicator from "./NewIndicator";

const App = () => {
  return (
    <Router>
      <div style={{ padding: 10 }}>
        <Switch>
          <Route path="/indicators/:id" exact>
            <IndicatorUpdate />
          </Route>
          <Route path="/new-indicator">
            <NewIndicator />
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
