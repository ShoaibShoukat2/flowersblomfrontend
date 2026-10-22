import { Navigate, Route, Routes } from "react-router-dom";
import { savedUser } from "./api";
import { AdminAccount, AdminHome, AdminShell, Analytics, Channels, Contacts, Deposits, Gateways, Leaderboard, Levels, Referrals, Rejected, Settings, TodayUsers, TodayWithdrawals, Transactions as AdminTransactions, Upgrades, UserDetail, Users, Withdrawals } from "./admin";
import { Channels as UserChannels, Contact, Dashboard, Deposit, Impersonate, Login, Register, Rewards as UserRewards, Team, Transactions, UserShell, Wallet, Withdraw, Work } from "./user";

function Guard({ role, children }) {
  const user = savedUser();
  if (!user || user.role !== role) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<Login role="admin" />} />
      <Route path="/app" element={<Guard role="user"><UserShell><Dashboard /></UserShell></Guard>} />
      <Route path="/app/work" element={<Guard role="user"><UserShell><Work /></UserShell></Guard>} />
      <Route path="/app/wallet" element={<Guard role="user"><UserShell><Wallet /></UserShell></Guard>} />
      <Route path="/app/team" element={<Guard role="user"><UserShell><Team /></UserShell></Guard>} />
      <Route path="/app/rewards" element={<Guard role="user"><UserShell><UserRewards /></UserShell></Guard>} />
      <Route path="/app/channels" element={<Guard role="user"><UserShell><UserChannels /></UserShell></Guard>} />
      <Route path="/app/withdraw" element={<Guard role="user"><UserShell><Withdraw /></UserShell></Guard>} />
      <Route path="/app/contact" element={<Guard role="user"><UserShell><Contact /></UserShell></Guard>} />
      <Route path="/app/transactions" element={<Guard role="user"><UserShell><Transactions /></UserShell></Guard>} />
      <Route path="/app/deposit" element={<Guard role="user"><UserShell><Deposit /></UserShell></Guard>} />
      <Route path="/app/plans" element={<Guard role="user"><UserShell><Deposit /></UserShell></Guard>} />
      <Route path="/admin" element={<Guard role="admin"><AdminShell><AdminHome /></AdminShell></Guard>} />
      <Route path="/admin/analytics" element={<Guard role="admin"><AdminShell><Analytics /></AdminShell></Guard>} />
      <Route path="/admin/transactions" element={<Guard role="admin"><AdminShell><AdminTransactions /></AdminShell></Guard>} />
      <Route path="/admin/users" element={<Guard role="admin"><AdminShell><Users searchable /></AdminShell></Guard>} />
      <Route path="/admin/users/:id" element={<Guard role="admin"><AdminShell><UserDetail /></AdminShell></Guard>} />
      <Route path="/admin/leaderboard" element={<Guard role="admin"><AdminShell><Leaderboard /></AdminShell></Guard>} />
      <Route path="/admin/referrals" element={<Guard role="admin"><AdminShell><Referrals /></AdminShell></Guard>} />
      <Route path="/admin/deposits" element={<Guard role="admin"><AdminShell><Deposits /></AdminShell></Guard>} />
      <Route path="/admin/withdrawals" element={<Guard role="admin"><AdminShell><Withdrawals /></AdminShell></Guard>} />
      <Route path="/admin/today-users" element={<Guard role="admin"><AdminShell><TodayUsers /></AdminShell></Guard>} />
      <Route path="/admin/today-withdrawals" element={<Guard role="admin"><AdminShell><TodayWithdrawals /></AdminShell></Guard>} />
      <Route path="/admin/rejected" element={<Guard role="admin"><AdminShell><Rejected /></AdminShell></Guard>} />
      <Route path="/admin/upgrades" element={<Guard role="admin"><AdminShell><Upgrades /></AdminShell></Guard>} />
      <Route path="/admin/gateways" element={<Guard role="admin"><AdminShell><Gateways /></AdminShell></Guard>} />
      <Route path="/admin/settings" element={<Guard role="admin"><AdminShell><Settings /></AdminShell></Guard>} />
      <Route path="/admin/channels" element={<Guard role="admin"><AdminShell><Channels /></AdminShell></Guard>} />
      <Route path="/admin/contacts" element={<Guard role="admin"><AdminShell><Contacts /></AdminShell></Guard>} />
      <Route path="/admin/levels" element={<Guard role="admin"><AdminShell><Levels /></AdminShell></Guard>} />
      <Route path="/admin/account" element={<Guard role="admin"><AdminShell><AdminAccount /></AdminShell></Guard>} />
      <Route path="/impersonate" element={<Impersonate />} />
    </Routes>
  );
}
