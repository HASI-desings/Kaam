import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import BottomNav from "./components/ui/BottomNav";

import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyMobile from "./pages/auth/VerifyMobile";
import CompleteProfile from "./pages/auth/CompleteProfile";

import JobFeed from "./pages/feed/JobFeed";
import JobDetails from "./pages/feed/JobDetails";

import PostJob from "./pages/jobs/PostJob";
import MyJobsAsClient from "./pages/jobs/MyJobsAsClient";
import MyJobsAsWorker from "./pages/jobs/MyJobsAsWorker";
import JobInProgress from "./pages/jobs/JobInProgress";

import Wallet from "./pages/wallet/Wallet";
import DepositRequest from "./pages/wallet/DepositRequest";
import WithdrawRequest from "./pages/wallet/WithdrawRequest";

import MyProfile from "./pages/profile/MyProfile";
import PublicProfile from "./pages/profile/PublicProfile";
import SkillQuiz from "./pages/profile/SkillQuiz";

import Plans from "./pages/subscription/Plans";
import JobChat from "./pages/chat/JobChat";

import RaiseDispute from "./pages/disputes/RaiseDispute";
import DisputeStatus from "./pages/disputes/DisputeStatus";

import ReviewQueue from "./pages/admin/ReviewQueue";
import DisputeReview from "./pages/admin/DisputeReview";
import AverageRateManager from "./pages/admin/AverageRateManager";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuthContext();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  const { session } = useAuthContext();

  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<RequireAuth><VerifyEmail /></RequireAuth>} />
        <Route path="/verify-mobile" element={<RequireAuth><VerifyMobile /></RequireAuth>} />
        <Route path="/complete-profile" element={<RequireAuth><CompleteProfile /></RequireAuth>} />

        <Route path="/feed" element={<RequireAuth><JobFeed /></RequireAuth>} />
        <Route path="/jobs/new" element={<RequireAuth><PostJob /></RequireAuth>} />
        <Route path="/jobs/mine/client" element={<RequireAuth><MyJobsAsClient /></RequireAuth>} />
        <Route path="/jobs/mine/worker" element={<RequireAuth><MyJobsAsWorker /></RequireAuth>} />
        <Route path="/jobs/:id" element={<RequireAuth><JobDetails /></RequireAuth>} />
        <Route path="/jobs/:id/progress" element={<RequireAuth><JobInProgress /></RequireAuth>} />
        <Route path="/jobs/:id/chat" element={<RequireAuth><JobChat /></RequireAuth>} />
        <Route path="/jobs/:id/dispute/new" element={<RequireAuth><RaiseDispute /></RequireAuth>} />
        <Route path="/jobs/:id/dispute" element={<RequireAuth><DisputeStatus /></RequireAuth>} />

        <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="/wallet/deposit" element={<RequireAuth><DepositRequest /></RequireAuth>} />
        <Route path="/wallet/withdraw" element={<RequireAuth><WithdrawRequest /></RequireAuth>} />

        <Route path="/profile" element={<RequireAuth><MyProfile /></RequireAuth>} />
        <Route path="/profile/:userId" element={<RequireAuth><PublicProfile /></RequireAuth>} />
        <Route path="/skills/:categoryId/quiz" element={<RequireAuth><SkillQuiz /></RequireAuth>} />

        <Route path="/plans" element={<RequireAuth><Plans /></RequireAuth>} />

        <Route path="/admin/review-queue" element={<RequireAuth><ReviewQueue /></RequireAuth>} />
        <Route path="/admin/disputes" element={<RequireAuth><DisputeReview /></RequireAuth>} />
        <Route path="/admin/average-rates" element={<RequireAuth><AverageRateManager /></RequireAuth>} />

        <Route path="*" element={<Navigate to={session ? "/feed" : "/login"} replace />} />
      </Routes>
      {session && <BottomNav />}
    </>
  );
}
