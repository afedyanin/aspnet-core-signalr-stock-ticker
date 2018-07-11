using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Services.Model;

namespace Services
{
    public class RandomStockTicker : IStockTickerService
    {
        private readonly object _marketStateLock = new object();
        private readonly object _updateStockPricesLock = new object();

        private readonly ConcurrentDictionary<string, Stock> _stocks = new ConcurrentDictionary<string, Stock>();

        // Stock can go up or down by a percentage of this factor on each change
        private readonly double _rangePercent = 0.002;

        private readonly TimeSpan _updateInterval = TimeSpan.FromMilliseconds(250);
        private readonly Random _updateOrNotRandom = new Random();

        private Timer _timer;
        private volatile bool _updatingStockPrices;

        public IStockTickerCallback Callback { get; set; }

        public RandomStockTicker()
        {
            LoadDefaultStocks();
        }

        public MarketState MarketState { get; private set; }

        public IEnumerable<Stock> GetAllStocks()
        {
            return _stocks.Values;
        }

        public Task OpenMarket()
        {
            lock (_marketStateLock)
            {
                if (MarketState != MarketState.Open)
                {
                    _timer = new Timer(UpdateStockPrices, null, _updateInterval, _updateInterval);
                    MarketState = MarketState.Open;
                    this.Callback?.OnMarketStateChanged(MarketState);
                }
            }

            return Task.CompletedTask;
        }

        public Task CloseMarket()
        {
            lock (_marketStateLock)
            {
                if (MarketState == MarketState.Open)
                {
                    if (_timer != null)
                    {
                        _timer.Dispose();
                    }

                    MarketState = MarketState.Closed;
                    this.Callback?.OnMarketStateChanged(MarketState);
                }
            }

            return Task.CompletedTask;
        }

        public Task Reset()
        {
            lock (_marketStateLock)
            {
                if (MarketState != MarketState.Closed)
                {
                    throw new InvalidOperationException("Market must be closed before it can be reset.");
                }

                LoadDefaultStocks();
                this.Callback?.OnMarketReset();
            }

            return Task.CompletedTask;
        }

        private void LoadDefaultStocks()
        {
            _stocks.Clear();

            var stocks = new List<Stock>
            {
                new Stock { Symbol = "MSFT", Price = 41.68m },
                new Stock { Symbol = "AAPL", Price = 92.08m },
                new Stock { Symbol = "GOOG", Price = 543.01m }
            };

            stocks.ForEach(stock => _stocks.TryAdd(stock.Symbol, stock));
        }

        private void UpdateStockPrices(object state)
        {
            // This function must be re-entrant as it's running as a timer interval handler
            lock (_updateStockPricesLock)
            {
                if (!_updatingStockPrices)
                {
                    _updatingStockPrices = true;

                    foreach (var stock in _stocks.Values)
                    {
                        if (TryUpdateStockPrice(stock))
                        {
                            this.Callback?.OnStockChanged(stock);
                        }
                    }

                    _updatingStockPrices = false;
                }
            }
        }

        private bool TryUpdateStockPrice(Stock stock)
        {
            // Randomly choose whether to udpate this stock or not
            var r = _updateOrNotRandom.NextDouble();
            if (r > 0.5)
            {
                return false;
            }

            // Update the stock price by a random factor of the range percent
            var random = new Random((int)Math.Floor(stock.Price));
            var percentChange = random.NextDouble() * _rangePercent;
            var pos = random.NextDouble() > 0.51;
            var change = Math.Round(stock.Price * (decimal)percentChange, 2);
            change = pos ? change : -change;

            stock.Price += change;
            return true;
        }
    }
}
