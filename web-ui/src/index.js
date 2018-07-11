import 'bootstrap/dist/css/bootstrap.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import DashboardBasic from './dashboard-basic';
import registerServiceWorker from './registerServiceWorker';

// const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

ReactDOM.render(
<Router>
    <DashboardBasic />
</Router>,
rootElement);

registerServiceWorker();
