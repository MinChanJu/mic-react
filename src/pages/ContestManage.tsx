import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { deleteUserById, getAllUsersByContestId, register } from "../api/user";
import { InitUser, User } from "../types/entity/User";
import { resultInterval } from "../utils/resultInterval";
import Table from "../components/Table";
import ErrorPage from "../components/ErrorPage";
import Loading from "../components/Loading";

const ContestManage: React.FC = () => {
  const { contestId } = useParams();
  const [participants, setPartcipants] = useState<User[]>([]);
  const [size, setSize] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    async function fetchData() {
      let requestId = '';
      try {
        const response = await getAllUsersByContestId(Number(contestId));
        requestId = response.data;
      } catch (error) {
        console.error("에러: ", error);
        setError(true);
      }

      resultInterval("users", requestId, setError, setLoad, setPartcipants);
    }
    fetchData();
  }, [])

  useEffect(() => {
    setSize(participants.length);
  }, [participants])

  if (error) return <ErrorPage />
  if (!load) return <Loading width={60} border={6} marginTop={250} />
  if(!participants) return <Loading width={60} border={6} />

  const generateUserId = (idx: number) => {
    const now = new Date()
    const date = [now.getFullYear() % 100, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()]

    let result = String(contestId)
    date.map((d) => {
      while (d >= 26) {
        result += 'Z'
        d -= 26
      }
      result += String.fromCharCode(d + 65)
    })
    result += idx

    return result;
  }

  const generateUserPw = (email: string, idx: number) => {
    let result = email.substring(0, 3)
    result += String(contestId)
    for (let index = 0; index < 5; index++) {
      result += String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    }
    result += idx

    return result;
  }

  const handleSubmit = async () => {
    setMessage("")
    setIsLoading(true)
    for (let index = size; index < participants.length; index++) {
      let requestData: User = participants[index];
      if (requestData.name === "" ||
        requestData.phone === "" ||
        requestData.email === ""
      ) {
        setMessage("빈칸을 채워넣으세요.");
        return;
      }
    }

    for (let index = size; index < participants.length; index++) {
      let requestData: User = participants[index];
      requestData.userId = generateUserId(index)
      requestData.userPw = generateUserPw(requestData.email, index);
      requestData.authority = 0;
      requestData.contestId = Number(contestId);
      requestData.createdAt = new Date().toISOString();

      try {
        await register(requestData);
      } catch (error) {
        console.error("에러: ", error);
        console.log(requestData)
      }
    }

    setIsLoading(false)
    window.location.reload()
  }

  const addParticipant = () => {
    setPartcipants((prev) => [...prev, InitUser]);
  }

  const deleteExample = async (index: number) => {
    if (participants[index].id != null) {
      setSize((prev) => prev-1)
      try {
        await deleteUserById(participants[index].id);
      } catch (error) {
        console.error("에러: ", error);
      }
    }
    setPartcipants((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const handleExampleChange = (index: number, field: "name" | "phone" | "email", value: string) => {
    setPartcipants((prev) =>
      prev.map((participant, idx) =>
        idx === index ? { ...participant, [field]: value } : participant
      )
    );
  };

  const formatter = (value: string, row: number, field: "name" | "phone" | "email") => {
    if (participants[row].userId !== '') return <>{value}</>
    return <input className="makeField" style={{ padding: "2px 6px" }}
      onChange={(e) => { handleExampleChange(row, field, e.target.value) }} />
  }

  const formatFunctions = {
    id: (_: number | null, row: number) => <>{row + 1}</>,
    name: (value: string, row: number) => formatter(value, row, "name"),
    phone: (value: string, row: number) => formatter(value, row, "phone"),
    email: (value: string, row: number) => formatter(value, row, "email"),
    authority: (_: number, row: number) => <button onClick={() => deleteExample(row)}>삭제</button>
  }

  return (
    <div className="list">
      <h1>참가자 관리</h1>
      <Table
        columnName={["번호", "이름", "아이디", "비밀번호", "전화번호", "이메일", "삭제"]}
        columnClass={["num", "", "", "", "", "", "edit"]}
        data={participants}
        dataName={["id", "name", "userId", "userPw", "phone", "email", "authority"]}
        dataFunc={formatFunctions} />
      <div className="flexRow red">{message}</div>
      <div className="flexRow gap20">
        <div className="button backBlue white" onClick={addParticipant}>참가자 추가</div>
        {size < participants.length && <div className="button backBlue white" onClick={handleSubmit}>{isLoading ? <div className="loading"></div> : <>저장</>}</div>}
      </div>
    </div>
  )
}

export default ContestManage