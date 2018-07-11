import React, { Component } from 'react';
import NavMenu from './nav-menu';
import Main from './main';
import './dashboard.css';

export default class DashboardBasic extends Component {

render() {
    return (
        <div id="container" className="container-fluid">
            <div className="row">
                <NavMenu />
                <Main />
            </div>
        </div>
    );
  }
}
