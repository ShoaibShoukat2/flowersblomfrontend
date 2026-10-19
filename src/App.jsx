import { Navigate, Route, Routes } from "react-router-dom";
import { savedUser } from "./api";
import { AdminHome, AdminShell, Analytics, Channels, Contacts, Deposits, Gateways, Leaderboard, Levels, Referrals, Rejected, Rewards, Settings, TodayUsers, TodayWithdrawals, Transactions as AdminTransactions, Upgrades, UserDetail, Users, Withdrawals } from "./admin";
import { Channels as UserChannels, Contact, Dashboard, Deposit, Login, Register, Rewards as UserRewards, Team, Transactions, UserShell, Wallet, Withdraw, Work } from "./user";

function guard(role, child) {
  const user = savedUser();
  if (!user || user.role !== role) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  return child;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<Login role="admin" />} />
      <Route path="/app" element={guard("user", <UserShell><Dashboard /></UserShell>)} />
      <Route path="/app/work" element={guard("user", <UserShell><Work /></UserShell>)} />
      <Route path="/app/wallet" element={guard("user", <UserShell><Wallet /></UserShell>)} />
      <Route path="/app/team" element={guard("user", <UserShell><Team /></UserShell>)} />
      <Route path="/app/rewards" element={guard("user", <UserShell><UserRewards /></UserShell>)} />
      <Route path="/app/channels" element={guard("user", <UserShell><UserChannels /></UserShell>)} />
      <Route path="/app/withdraw" element={guard("user", <UserShell><Withdraw /></UserShell>)} />
      <Route path="/app/contact" element={guard("user", <UserShell><Contact /></UserShell>)} />
      <Route path="/app/transactions" element={guard("user", <UserShell><Transactions /></UserShell>)} />
      <Route path="/app/deposit" element={guard("user", <UserShell><Deposit /></UserShell>)} />
      <Route path="/app/plans" element={guard("user", <UserShell><Deposit /></UserShell>)} />
      <Route path="/admin" element={guard("admin", <AdminShell><AdminHome /></AdminShell>)} />
      <Route path="/admin/analytics" element={guard("admin", <AdminShell><Analytics /></AdminShell>)} />
      <Route path="/admin/users" element={guard("admin", <AdminShell><Users searchable /></AdminShell>)} />
      <Route path="/admin/users/:id" element={guard("admin", <AdminShell><UserDetail /></AdminShell>)} />
      <Route path="/admin/leaderboard" element={guard("admin", <AdminShell><Leaderboard /></AdminShell>)} />
      <Route path="/admin/referrals" element={guard("admin", <AdminShell><Referrals /></AdminShell>)} />
      <Route path="/admin/deposits" element={guard("admin", <AdminShell><Deposits /></AdminShell>)} />
      <Route path="/admin/withdrawals" element={guard("admin", <AdminShell><Withdrawals /></AdminShell>)} />
      <Route path="/admin/today-users" element={guard("admin", <AdminShell><TodayUsers /></AdminShell>)} />
      <Route path="/admin/today-withdrawals" element={guard("admin", <AdminShell><TodayWithdrawals /></AdminShell>)} />
      <Route path="/admin/rejected" element={guard("admin", <AdminShell><Rejected /></AdminShell>)} />
      <Route path="/admin/upgrades" element={guard("admin", <AdminShell><Upgrades /></AdminShell>)} />
      <Route path="/admin/gateways" element={guard("admin", <AdminShell><Gateways /></AdminShell>)} />
      <Route path="/admin/transactions" element={guard("admin", <AdminShell><AdminTransactions /></AdminShell>)} />
      <Route path="/admin/settings" element={guard("admin", <AdminShell><Settings /></AdminShell>)} />
      <Route path="/admin/channels" element={guard("admin", <AdminShell><Channels /></AdminShell>)} />
      <Route path="/admin/contacts" element={guard("admin", <AdminShell><Contacts /></AdminShell>)} />
      <Route path="/admin/levels" element={guard("admin", <AdminShell><Levels /></AdminShell>)} />
      <Route path="/admin/rewards" element={guard("admin", <AdminShell><Rewards /></AdminShell>)} />
    </Routes>
  );
}
