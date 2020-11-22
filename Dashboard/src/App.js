import logo from './logo.svg';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Auth from "./AuthPage"
import Main from "./MainPage";
import Callback from "./CallbackPage"
import "antd/dist/antd.css";

function App() {


  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/callback">
            <Callback />
          </Route>
          <Route path="/app">
            <Main />
          </Route>
          <Route path="/auth">
            <Auth />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
