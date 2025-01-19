import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { MathJax, MathJaxContext } from 'better-react-mathjax'
import { AxiosError } from "axios"
import { deleteProblemById, getProblemById } from "../api/problem"
import { getAllSolvesByUserId, solveProblem } from "../api/solve"
import { runCode } from "../api/myData"
import { mathJaxConfig } from "../constants/mathJaxConfig"
import { useUser } from "../context/UserContext"
import { Problem } from "../types/Problem"
import { CodeDTO } from "../types/CodeDTO"
import { Solve } from "../types/Solve"
import { autoResize } from "../utils/resize"
import useNavigation from "../hooks/useNavigation"
import "../styles/ProblemView.css"
import "../styles/styles.css"



const ProblemView: React.FC = () => {
  const { problemId } = useParams();
  const { user, solves, setSolves } = useUser()
  const { goToProblemEdit, goToHome } = useNavigation()
  const [problem, setProblem] = useState<Problem>()
  const [lang, setLang] = useState<string>('Python');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    async function loadProblem() {
      try {
        const response = await getProblemById(Number(problemId));
        setProblem(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response) console.error("응답 에러: ", error.response.data.message);
          else console.error("서버 에러: ", error)
        } else {
          console.error("알 수 없는 에러:", error);
        }
      }
    }
    loadProblem();
  }, []);

  if (!problem) return <div className="loading"></div> 


  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(event.target.value);
  };

  const deleteProblem = async (problemId: number) => {
    try {
      await deleteProblemById(problemId);
      goToHome();
      window.location.reload();
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) console.error("응답 에러: ", error.response.data.message);
        else console.error("서버 에러: ", error)
      } else {
        console.error("알 수 없는 에러:", error);
      }
    }
  };

  const submitCode = async () => {
    setIsLoading(true);
    setMessage("")
    if (code !== "") {
      const requestData: CodeDTO = {
        userId: user.userId,
        code: code,
        lang: lang,
        problemId: problem!.id!
      };

      try {
        const response = await runCode(requestData)
        setMessage(response.data);

        let solve: Solve = {
          id: -1,
          userId: user.userId,
          problemId: problem!.id!,
          score: 0,
          lang: lang,
          code: code,
          createdAt: new Date().toISOString()
        };

        const num = Number(response.data);
        if (!isNaN(num)) solve.score = Math.floor(num * 10);

        await solveProblem(solve);

        const response2 = await getAllSolvesByUserId(user.userId)
        setSolves(response2.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response) console.error("응답 예러: ", error.response.data.message);
          else console.error("서버 에러: ", error)
        } else {
          console.error("알 수 없는 에러:", error);
        }
      }

    } else {
      setMessage("코드를 작성해주세요")
    }
    setIsLoading(false);
  }

  const insertKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const key = (insert: string, num: number) => {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setCode(code.substring(0, start) + insert + code.substring(end));
      requestAnimationFrame(() => { textarea.selectionStart = textarea.selectionEnd = start + insert.length - num; });
      autoResize(event);
    }

    if (event.key === 'Tab') key("    ", 0)
    if (event.key === '(') key("()", 1)
    if (event.key === '{') key("{}", 1)
    if (event.key === '[') key("[]", 1)
    if (event.key === '"') key('""', 1)
    if (event.key === "'") key("''", 1)
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
    autoResize(event);
  }

  return (
    <div className="Problem">
      <MathJaxContext config={mathJaxConfig}>
        <div className="prblemName"><MathJax>{problem.problemName}</MathJax></div>
      </MathJaxContext>
      {(user.authority === 5 || user.userId === problem.userId) &&
        <div className="owner" style={{ marginTop: '30px' }}>
          <span className="editButton" onClick={() => { goToProblemEdit(problem.id!) }}>편집</span>
          <span className="deleteButton" onClick={() => { deleteProblem(problem.id!) }}>삭제</span>
        </div>
      }
      {(() => {
        const filtered = solves.filter((solve) => solve.userId === user.userId && solve.problemId === problem.id);

        if (filtered.length === 0) return <></>;

        const score = filtered[0].score;
        let style = { backgroundColor: "rgb(238, 255, 0)" };
        if (score === 1000) style.backgroundColor = "rgb(43, 255, 0)";
        if (score === 0) style.backgroundColor = "rgb(255, 0, 0)";

        return <div className="owner"><div className="solve" style={style}>{score / 10}</div></div>;
      })()}
      <MathJaxContext config={mathJaxConfig}>
        <div style={{ position: 'relative', zIndex: -1 }}>
          <div className="titleDes">
            <div className="desName">문제 설명</div>
            <div className="problemDes"><MathJax>{problem.problemDescription}</MathJax></div>
          </div>
          <div className="titleDes">
            <div className="desName">입력에 대한 설명</div>
            <div className="problemDes"><MathJax>{problem.problemInputDescription}</MathJax></div>
          </div>
          <div className="titleDes">
            <div className="desName">출력에 대한 설명</div>
            <div className="problemDes"><MathJax>{problem.problemOutputDescription}</MathJax></div>
          </div>
        </div>
      </MathJaxContext>
      <div className="doubleDes">
        <div className="titleDes">
          <div className="desName">입력 예제</div>
          <div className="problemDes">{problem.problemExampleInput}</div>
        </div>
        <div className="titleDes">
          <div className="desName">출력 예제</div>
          <div className="problemDes">{problem.problemExampleOutput}</div>
        </div>
      </div>
      {user.id === -1 && <div className="resultMessage">코드를 제출하려면 로그인을 해주세요.</div>}
      {user.id !== -1 && <><div className="resultMessage">{message}</div>
        <div className="doubleDes">
          <div className="titleDes">
            <div className="desName">코드</div>
          </div>
          <div className="titleDes left">
            <select className="desName" value={lang} onChange={handleLanguageChange}>
              <option value="Python">Python</option>
              <option value="C">C</option>
              <option value="JAVA">JAVA</option>
            </select>
          </div>
        </div>
        <textarea className="codeForm" value={code} onInput={handleInput} onKeyDown={insertKey} spellCheck={false} />
        <div className="submitCode" onClick={submitCode}>
          {isLoading ? <div className="loading"></div> : <div>제출</div>}
        </div></>}
    </div>
  )
}

export default ProblemView