import ActiveTrades from "./components/ActiveTrades";
import Authentication from "./components/Authentication";
import BitcoinCashPrice from "./components/BitcoinCashPrice";
import BitcoinPrice from "./components/BitcoinPrice";
import DashPrice from "./components/DashPrice";
import LitecoinPrice from "./components/LitecoinPrice";
import MarketplaceBuy from "./components/MarketplaceBuy";
import MarketplaceSell from "./components/MarketplaceSell";
import TradeStatusChart from "./components/TradeStatusChart";
import ZcashPrice from "./components/ZcashPrice";
import EthereumPrice from "./components/EthereumPrice";

export default [
    {
        name      : 'active_trades',
        canShow   : (auth) => {
            return auth.check();
        },
        component : ActiveTrades
    },
    {
        name      : 'authentication',
        canShow   : (auth) => {
            return !auth.check();
        },
        component : Authentication
    },
    {
        name      : 'bitcoin_cash_price',
        component : BitcoinCashPrice
    },
    {
        name      : 'bitcoin_price',
        component : BitcoinPrice
    },
    {
        name      : 'dash_price',
        component : DashPrice
    },
    {
        name      : 'litecoin_price',
        component : LitecoinPrice
    },
    {
        name      : 'zcash_price',
        component : ZcashPrice
    },
    {
        name      : 'ethereum_price',
        component : EthereumPrice
    },
    {
        name      : 'marketplace_buy',
        component : MarketplaceBuy
    },
    {
        name      : 'marketplace_sell',
        component : MarketplaceSell
    },
    {
        name      : 'trade_status_chart',
        canShow   : (auth) => {
            return auth.check();
        },
        component : TradeStatusChart
    },
];
