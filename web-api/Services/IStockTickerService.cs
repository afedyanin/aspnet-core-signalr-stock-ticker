using System.Collections.Generic;
using System.Threading.Tasks;
using Services.Model;

namespace Services
{
    public interface IStockTickerService
    {
        IStockTickerCallback Callback { get; set; }

        MarketState MarketState { get; }
        IEnumerable<Stock> GetAllStocks();

        Task OpenMarket();
        Task CloseMarket();
        Task Reset();
    }
}
