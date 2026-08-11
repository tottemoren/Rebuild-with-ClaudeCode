import "./RegisterPage.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [inviteCode, setInviteCode] =
    useState("");

  const navigate = useNavigate();

  const register = async (): Promise<void> => {

  const response = await fetch(
    "http://localhost:8080/api/users/register",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username,
        password: password,
        inviteCode: inviteCode,
      }),
    }
  );

  const data = await response.text();

  console.log(data);

  if (response.ok) {
    alert("登録成功");
    navigate("/")
  }
};

  return (

    <div className="register-page">

      <div className="register-box">

        <img
          className="register-logo"
          src="/images/settingimages/RebuildRogo1.png"
          alt="logo"
        />

        <h2>
          新規登録
        </h2>

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <input
          type="password"
          placeholder="招待コード"
          value={inviteCode}
          onChange={(e) =>
            setInviteCode(
              e.target.value
            )
          }
        />

        <button 
          className="register-button"
          onClick={register}>
          登録
        </button>

      <button
        className="back-login-button"
        onClick={() => navigate("/")}
      >
        ログイン画面へ戻る
      </button>

      </div>

    </div>

  );
}

export default RegisterPage;