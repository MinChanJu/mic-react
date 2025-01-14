import React from "react"
import { Contest, Problem, Solve, User } from "../model/talbe"
import CommonFunction from "../model/CommonFunction"
import logo from "../assets/MiC_logo.png"
import './css/Header.css'

interface HeaderProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setSolves: React.Dispatch<React.SetStateAction<Solve[]>>;
  problems: Problem[]
  contests: Contest[]
}

const Header: React.FC<HeaderProps> = ({ user, setUser, setSolves, problems, contests }) => {
  const { goToContest, goToContestId, goToHome, goToLogin, goToProblem, goToProblemId, goToSetting, goToUserId, logout } = CommonFunction()
  const finishContests = contests.filter((contest) => new Date(contest.eventTime) < new Date())

  return (
    <header>
      <div className="logo" onClick={() => { goToHome(); window.location.reload();}}>
        <img className="logoImg" src={logo} alt="" />
        <span className="logoTitle">
          <div>Mathematics</div>
          <div>in Coding</div>
        </span>
      </div>
      <div className="menu-container">
        <div className="login">
          {user.name !== "" && <span onClick={() => { goToUserId(user.userId) }}>{user.name}</span>}
          {user.name !== "" && <span style={{ marginLeft: '10px', marginRight: '10px', fontSize: '20px' }}>|</span>}
          {user.name !== "" && <span onClick={goToSetting}>설정</span>}
          {user.name !== "" && <span style={{ marginLeft: '10px', marginRight: '10px', fontSize: '20px' }}>|</span>}
          {user.name === "" && <span onClick={goToLogin}>로그인</span>}
          {user.name !== "" && <span onClick={() => { logout(setUser, setSolves) }}>로그아웃</span>}
        </div>
        <div className="menu">
          {user.contestId == -1 && <div className="select-menu" onClick={goToProblem}>문제</div>}
          <div className="select-menu" onClick={goToContest}>대회</div>
          <div className="description">
            {user.contestId == -1 && <div className="select-menu-description">
              <h2>문제</h2>
              {problems.slice(-5).map((problem) => (
                <div key={problem.id} onClick={() => { goToProblemId(problem.id) }}>{String(problem.id).padStart(3, '0')}. {problem.problemName}</div>
              ))}
            </div>}
            <div className="select-menu-description">
              <h2>대회</h2>
              {finishContests.slice(0, 5).map((contest) => (
                <div key={contest.id} onClick={() => { goToContestId(user, contest, false) }}>{contest.contestName}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header