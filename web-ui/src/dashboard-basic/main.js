import React from 'react';
import { Route } from "react-router-dom";

import StockTicker from "./components/StockTicker";

const Main = (props) => (
    <main role="main" className="col-sm-9 ml-sm-auto col-md-10 pt-3">
      <h1>Dashboard</h1>
      <Route exact path="/" render={() => <StockTicker apiUrl="http://localhost:5000/stock-ticker"/> } />
      <Route path="/stocks" render={() => <StockTicker apiUrl="http://localhost:5000/stock-ticker"/> } />

    </main>
);

export default Main;
