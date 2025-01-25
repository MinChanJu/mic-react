import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { AxiosError } from "axios"
import { getContestById, updateContest } from "../api/contest"
import { useUser } from "../context/UserContext"
import { StringToTime } from "../utils/formatter"
import { Contest } from "../types/entity/Contest"
import useNavigation from "../hooks/useNavigation"
import ErrorPage from "../components/ErrorPage"
import Loading from "../components/Loading"


const EditContest: React.FC = () => {
  const { user } = useUser();
  const { goToContestId } = useNavigation()
  const { contestId } = useParams();
  const [editMessage, setEditMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contest, setContest] = useState<Contest>();
  const userIdRef = useRef<HTMLInputElement>(null);
  const contestNameRef = useRef<HTMLInputElement>(null);
  const contestPasswordRef = useRef<HTMLInputElement>(null);
  const contestCheckPasswordRef = useRef<HTMLInputElement>(null);
  const contestDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadContest() {
      try {
        const response = await getContestById(Number(contestId));
        setContest(response.data);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response) console.error("응답 에러: ", error.response.data.message);
          else console.error("서버 에러: ", error)
        } else {
          console.error("알 수 없는 에러:", error);
        }
        setError(true)
      }
    }
    loadContest();
  }, []);

  if (error) return <ErrorPage />
  if (!contest) return <Loading width={60} border={6} />

  const handleSubmit = async () => {
    setIsLoading(true)
    setEditMessage("")
    if (userIdRef.current &&
      contestNameRef.current &&
      contestPasswordRef.current &&
      contestCheckPasswordRef.current &&
      contestDescriptionRef.current &&
      startTimeRef.current &&
      endTimeRef.current) {
      if (userIdRef.current.value === user.userId && user.userId !== "") {
        if (contestPasswordRef.current.value === contestCheckPasswordRef.current.value) {
          if (contestNameRef.current.value !== '') {
            if (startTimeRef.current.value !== "" || endTimeRef.current.value === "") {
              const requestData: Contest = {
                id: contest.id,
                userId: userIdRef.current.value,
                contestName: contestNameRef.current.value,
                contestDescription: contestDescriptionRef.current.value,
                contestPw: contestPasswordRef.current.value === "" ? null : contestPasswordRef.current.value,
                startTime: startTimeRef.current.value === "" ? null : new Date(startTimeRef.current.value).toISOString(),
                endTime: endTimeRef.current.value === "" ? null : new Date(endTimeRef.current.value).toISOString(),
                createdAt: contest.createdAt,
              };

              try {
                const response = await updateContest(requestData);
                goToContestId(response.data.id!);
                window.location.reload()
              } catch (error) {
                if (error instanceof AxiosError) {
                  if (error.response) setEditMessage("응답 에러: " + error.response.data.message);
                  else console.error("서버 에러: ", error)
                } else {
                  console.error("알 수 없는 에러:", error);
                }
              }
            } else {
              setEditMessage("죵료 시간을 입력하려면 시작 시간을 입력해야합니다.")
            }
          } else {
            setEditMessage("이름 작성 필요")
          }
        } else {
          setEditMessage("비밀번호 불일치")
        }
      } else {
        setEditMessage("아이디 불일치")
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="makeContainer">
      <div className="makeBox">
        <h2>대회 정보 기입</h2>
        <div className="makeGroup">
          <div className="makeTitle">본인 아이디</div>
          <input className="makeField" ref={userIdRef} type="text" />
        </div>
        <div className="makeGroup">
          <div className="makeTitle">대회 제목</div>
          <input className="makeField" ref={contestNameRef} defaultValue={contest.contestName} type="text" />
        </div>
        <div className="doubleMakeGroup">
          <div className="makeGroup">
            <div className="makeTitle">대회 비밀번호</div>
            <input className="makeField" ref={contestPasswordRef} defaultValue={contest.contestPw == null ? "" : contest.contestPw} type="password" />
          </div>
          <div className="makeGroup">
            <div className="makeTitle">비밀번호 확인</div>
            <input className="makeField" ref={contestCheckPasswordRef} defaultValue={contest.contestPw == null ? "" : contest.contestPw} type="password" />
          </div>
        </div>
        <div style={{ marginTop: '10px', color: 'red' }}>누구나 접근할 수 있는 대회를 개최하려면 빈칸으로 해주세요.</div>
        <div className="doubleMakeGroup">
          <div className="makeGroup">
            <div className="makeTitle">대회 개최 시간</div>
            <input className="makeField" ref={startTimeRef} defaultValue={contest.startTime == null ? "" : StringToTime(contest.startTime)} type="datetime-local" />
          </div>
          <div className="makeGroup">
            <div className="makeTitle">대회 진행 시간 (분 단위)</div>
            <input className="makeField" ref={endTimeRef} defaultValue={contest.endTime == null ? "" : StringToTime(contest.endTime)} type="datetime-local" />
          </div>
        </div>
        <div className="makeGroup">
          <div className="makeTitle">대회 설명</div>
          <textarea className="makeField" ref={contestDescriptionRef} defaultValue={contest.contestDescription} style={{ height: '100px' }} />
        </div>
        <span className="red">{editMessage}</span>
        <div className="makeButton" onClick={handleSubmit}>
          {isLoading ? <Loading /> : <>대회 편집</>}
          </div>
      </div>
    </div>
  )
}

export default EditContest