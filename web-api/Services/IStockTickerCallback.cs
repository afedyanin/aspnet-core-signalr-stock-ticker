using System.Threading.Tasks;
using Services.Model;

namespace Services
{
    public interface IStockTickerCallback
    {
        Task OnMarketStateChanged(MarketState state);
        Task OnMarketReset();
        Task OnStockChanged(Stock stock);
    }
}
