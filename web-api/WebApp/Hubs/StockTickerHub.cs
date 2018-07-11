using Microsoft.AspNetCore.SignalR;
using Services;
using System;
using System.Threading.Tasks;

namespace WebApp.Hubs
{
    public class StockTickerHub : Hub
    {
        private readonly IStockTickerService _stockTicker;

        public StockTickerHub(IStockTickerService stockTicker)
        {
            _stockTicker = stockTicker;
        }

        public async Task GetAllStocks()
        {
            await Clients.All.SendAsync("OnAllStocks", _stockTicker.GetAllStocks());
        }

        public async Task OpenMarket()
        {
            await _stockTicker.OpenMarket();
        }

        public async Task CloseMarket()
        {
            await _stockTicker.CloseMarket();
        }

        public async Task Reset()
        {
            await _stockTicker.Reset();
        }

        public override Task OnConnectedAsync()
        {
            _stockTicker.Callback = new StockTickerCallback(Clients.All);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            _stockTicker.Callback = new StockTickerCallback(Clients.All);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
