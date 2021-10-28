import WelcomeCard from "./components/WelcomeCard";
import TotalUsers from "./components/TotalUsers";
import TotalRevenue from "./components/TotalRevenue";
import MarketplaceEarningsChart from "./components/MarketplaceEarningsChart";
import MarketplaceStatistics from "./components/MarketplaceStatistics";
import UserRegistrationsChart from "./components/UserRegistrationsChart";
import FailedJobs from "./components/FailedJobs";

export default [
	{
		name      : 'welcome_card',
		component : WelcomeCard
	},
	{
		name      : 'total_users',
		component : TotalUsers
	},
	{
		name      : 'total_revenue',
		component : TotalRevenue
	},
	{
		name      : 'marketplace_earnings_chart',
		component : MarketplaceEarningsChart
	},
	{
		name      : 'marketplace_statistics',
		component : MarketplaceStatistics
	},
	{
		name      : 'user_registrations_chart',
		component : UserRegistrationsChart
	},
	{
		name      : 'failed_jobs',
		component : FailedJobs
	},
];