import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { URL, Contest, Problem, Solved, User, InitUser, ProblemsAndContestsDTO } from './model/talbe'
import axios from 'axios';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import ContestList from './components/ContestList';
import EditContest from './components/EditContest';
import ContestMake from './components/ContestMake';
import ContestView from './components/ContestView';
import ProblemList from './components/ProblemList';
import EditProblem from './components/EditProblem';
import ProblemMake from './components/ProblemMake';
import ProblemView from './components/ProblemView';
import UserView from './components/UserView';
import SettingView from './components/SettingView';
import ScoreBoard from './components/ScoreBoad';
import './App.css'

function App() {
  const [user, setUser] = useState<User>(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : InitUser;
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [solveds, setSolveds] = useState<Solved[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post<ProblemsAndContestsDTO>(URL + 'data', null, { timeout: 10000 });
        const data = response.data;
        if (user.contest == -1) {
          setProblems(data.problems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setContests(data.contests.sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()));
        } else {
          setProblems(data.problems.filter((problem) => { return problem.contestId == user.contest; }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setContests(data.contests.filter((contest) => { return contest.id == user.contest; }).sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()));
        }
      } catch (error) { console.log("서버 오류 " + error) }

      if (user.id != -1) {
        try {
          const response = await axios.post<Solved[]>(URL + `solveds/${user.userId}`, { timeout: 10000 });
          setSolveds(response.data);  // ✅ 배열이면 상태 업데이트
        } catch (error) { console.log("서버 오류 " + error) }
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <Header user={user} setUser={setUser} setSolveds={setSolveds} problems={problems} contests={contests} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/contest" element={<ContestList user={user} contests={contests} />} />
        <Route path="/contest/edit/:id" element={<EditContest user={user} contests={contests} />} />
        <Route path="/contest/make" element={<ContestMake user={user} />} />
        <Route path="/contest/:id" element={<ContestView user={user} contests={contests} problems={problems} solveds={solveds} />} />
        <Route path="/score/:id" element={<ScoreBoard contests={contests} problems={problems} />} />
        <Route path="/problem" element={<ProblemList user={user} contests={contests} problems={problems} solveds={solveds} />} />
        <Route path="/problem/edit/:id" element={<EditProblem problems={problems} />} />
        <Route path="/problem/make/:id" element={<ProblemMake user={user} />} />
        <Route path="/problem/:id" element={<ProblemView user={user} problems={problems} solveds={solveds} setSolveds={setSolveds} />} />
        <Route path="/user/:id" element={<UserView />} />
        <Route path="/setting" element={<SettingView user={user} contests={contests} problems={problems} solveds={solveds} />} />
      </Routes>
    </div>
  )
}

export default App
