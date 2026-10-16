import "./RegisterPage.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

function RegisterPage() {

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [inviteCode, setInviteCode] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const navigate = useNavigate();

  const register = async (): Promise<void> => {

  setErrorMessage("");

  let response: Response;

  try {
    response = await apiFetch(
    `/api/users/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        inviteCode: inviteCode,
      }),
    }
  );
  } catch {
    setErrorMessage("サーバーに接続できませんでした。時間をおいて試してください");
    return;
  }

  if (response.ok) {
    alert("登録成功");
    navigate("/")
    return;
  }

  // 招待コード違い・重複などの理由は、サーバーが文章で返す
  const message = await response.text();
  setErrorMessage(message || "登録できませんでした");
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
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) =>
            setEmail(
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

        {errorMessage && (
          <p className="register-error" role="alert">
            {errorMessage}
          </p>
        )}

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