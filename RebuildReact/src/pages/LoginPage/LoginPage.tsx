import "./LoginPage.css"

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {

  const [username, setUsername] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const login = async (): Promise<void> => {

    const response = await fetch(
      "http://localhost:8080/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          password
        })
      }
    );

    if (response.ok) {

      navigate("/home");

    } else {

      alert( "ユーザー名またはパスワードが違います");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <img
          className="login-logo"
          src="/images/settingimages/RebuildRogo1.png"
          alt="logo"
        />

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          className="login-button"
          onClick={login}>
          ログイン
        </button>

        <div className="divider"></div>

        <p>アカウントをお持ちでない方</p>

        <button
          className="back-register-button"
          onClick={() => navigate("/register")}
        >
          新規登録
        </button>

      </div>

    </div>

  );
}

export default LoginPage;