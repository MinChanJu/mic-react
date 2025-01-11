import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { URL, User } from "../model/talbe"
import axios from "axios"
import "./css/UserView.css"

const UserView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [curUser, setCurUser] = useState<User>();
  const [year, setYear] = useState<string>();
  const [month, setMonth] = useState<string>();
  const [day, setDay] = useState<string>();

  useEffect(() => {
    async function serverObject() {
      try {
        const response = await axios.post<User>(URL + `users/${id}`, null, { timeout: 10000 });
        setCurUser(response.data);
      } catch (error) { console.log("서버 오류 " + error) }
    }
    serverObject();
  }, []);

  useEffect(() => {
    setYear(curUser?.createdAt.substring(0, 4))
    setMonth(curUser?.createdAt.substring(5, 7))
    setDay(curUser?.createdAt.substring(8, 10))
  }, [curUser])

  return (
    <div className="userView">
      <h1>정보</h1>
      <div className="userElement">
        <h4>{curUser?.name}</h4>
        <div>아이디: {curUser?.userId}</div>
        <div>이메일: {curUser?.email}</div>
        <div>가입 날짜: {year}년 {month}월 {day}일</div>
      </div>
    </div>
  )
}

export default UserView