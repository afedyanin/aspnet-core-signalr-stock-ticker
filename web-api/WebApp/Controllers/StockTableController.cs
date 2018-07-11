namespace WebApp.Controllers
{
    using System.Collections.Generic;
    using Microsoft.AspNetCore.Mvc;
    using Services;
    using Services.Model;

    [Route("api/[controller]")]
    [ApiController]
    public class StockTableController : ControllerBase
    {
        private readonly IStockTickerService dataProvider;

        public StockTableController(IStockTickerService marketDataProvider)
        {
            this.dataProvider = marketDataProvider;
        }

        [HttpGet("[action]")]
        public IEnumerable<Stock> AllStocks()
        {
            return this.dataProvider.GetAllStocks();
        }
    }
}