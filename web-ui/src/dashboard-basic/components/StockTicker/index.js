import React, { Component } from 'react';
import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';

export default class StockTicker extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            stocks: [], 
            loading: true, 
            error: null,
            isMarketOpened : false 
        };

        this.connection = null;
        this.apiUrl = props.apiUrl;
        this.openButtonHandler = this.openButtonHandler.bind(this);
        this.closeButtonHandler = this.closeButtonHandler.bind(this);
        this.resetButtonHandler = this.resetButtonHandler.bind(this);
    }

    componentDidMount() {
        this.connection = this.connect();
    }

    updateStock(stock) {
        let stocks =  [...this.state.stocks];
        stocks.forEach( (s, index) => {
            if (s.symbol === stock.symbol)
            {
                stocks[index] = stock;
            }
        });

        this.setState({stocks});
    }

    connect() {

        let connection = new HubConnectionBuilder()
            .withUrl(this.apiUrl)
            .configureLogging(LogLevel.Trace)
            .build();

        connection.onclose(
            (e) => {
                if (e) {
                    this.setState({ error: e });
                    console.error('Connection closed with error: ' + e);
                }
                else {
                    console.info('Disconnected');
                }
            }
        );

        connection.on("OnAllStocks", (stocks) => {
            const msg = "All stocks received. Count=" + stocks.length;
            this.setState({stocks: stocks});
            console.info(msg);
        });
        
        connection.on("OnMarketStateChanged", (marketState) => {
            const msg = "Market state: " + marketState;
            console.info(msg);
        });
        
        connection.on("OnReset", () => {
            console.info("OnReset");
            this.connection.invoke("GetAllStocks")
                .catch(err => console.error(err.toString()));
        });
        
        connection.on("OnStockChanged", (stock) => {
            this.updateStock(stock);
        });

        connection.start()
        .then(() => {  
            console.info('Connected successfully'); 
            this.setState({ loading: false });
        })
        .catch(err => {
            this.setState({ error: err });
            console.error(err.toString());
        });

        return connection;
    }

    openButtonHandler() {
        this.connection.invoke("OpenMarket")
        .catch(err => {
            console.error(err.toString());
        })
        .then(()=> {
            this.connection.invoke("GetAllStocks")
            .catch(err => console.error(err.toString()));
            this.setState({ isMarketOpened: true });
        });
    }

    closeButtonHandler() {
        this.connection.invoke("CloseMarket")
        .catch(err => {
            console.error(err.toString());
        })
        .then(()=> {
            this.setState({ isMarketOpened: false });
        });
    }

    resetButtonHandler() {
        this.connection.invoke("Reset")
        .catch(err => {
            console.error(err.toString());
        })
    }

    renderStockTable(stocks) {
        return (
            <div>
                <div className="row">
                    <div className="col-6">
                        <button onClick={this.openButtonHandler} disabled={this.state.isMarketOpened}>Open Market</button>
                        <button onClick={this.closeButtonHandler} disabled={!this.state.isMarketOpened}>Close Market</button>
                        <button onClick={this.resetButtonHandler} disabled={this.state.isMarketOpened}>Reset</button>
                    </div>
                    <div className="col-6">
                      <div className="alert alert-secondary" role="alert">
                        Market: {this.state.isMarketOpened ? "Opened" : "Closed"}
                      </div>
                    </div>
                </div>
                <div className="row">&nbsp;</div>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Open</th>
                                <th>Low</th>
                                <th>High</th>
                                <th>LastChange</th>
                                <th>Change</th>
                                <th>% Change</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                        {stocks.map(s =>
                            <tr key={s.symbol}>
                                <td>{s.symbol}</td>
                                <td>{s.dayOpen}</td>
                                <td>{s.dayLow}</td>
                                <td>{s.dayHigh}</td>
                                <td>{s.lastChange}</td>
                                <td>{s.change}</td>
                                <td>{s.percentChange}</td>
                                <td>{s.price}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
        
    render() {

        let contents = this.state.error
        ? <p><em>Error: {this.state.error.message}</em></p>
        : this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderStockTable(this.state.stocks);

        return (
            <div>
                <h2>Stock Ticker Sample</h2>
                {contents}
            </div>
        );
    }
}