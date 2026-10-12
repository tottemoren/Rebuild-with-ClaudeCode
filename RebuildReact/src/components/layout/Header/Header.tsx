import "./Header.css"

import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import useLoginUser from "../../../hooks/useLoginUser";
import type { User } from "../../../types/User";
import { highlightExactMatches } from "../../../utils/searchHighlight";

type HeaderProps = {
  centerContent?: React.ReactNode
  secondaryRow?: React.ReactNode
}

function Header({ centerContent, secondaryRow }: HeaderProps) {

  const navigate = useNavigate();

  const [user, setUser] = useState<User>(useLoginUser());
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const logout = () => {
    localStorage.removeItem("loginUser");
    alert("ログアウトしました");
    navigate("/");
  };

  const handleSearch = () => {
    const matchCount = highlightExactMatches(searchQuery);

    if (!searchQuery.trim()) {
      return;
    }

    if (matchCount === 0) {
      alert("一致する項目が見つかりませんでした");
    } else {
      alert(`${matchCount}件の項目が一致しました`);
    }
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const openProfileImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user?.id) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedUser: User = await response.json();
        setUser(updatedUser);

        localStorage.setItem("loginUser", JSON.stringify(updatedUser));
      } else {
        alert("プロフィール画像のアップロードに失敗しました");
      }
    } catch {
      alert("プロフィール画像のアップロードに失敗しました（通信エラー）");
    } finally {
      setIsUploading(false);
    }
  };

  const defaultCenterContent = (
    <>
      <input
        type="text"
        placeholder="メモ・ストーリーを検索"
        aria-label="メモ・ストーリーを検索"
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearchKeyDown}
      />
      <button
        className="modern-button search-button"
        onClick={handleSearch}
        aria-label="検索"
      >
        <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="HomePagetop">

      <div className="LogomarkSpace">
        <button
          type="button"
          className="Logomark"
          aria-label="Rebuild（再読み込み）"
          onClick={() => window.location.reload()}
        >
          <svg className="Logomark-mark" viewBox="0 0 26 26" aria-hidden="true">
            <rect width="26" height="26" rx="7" />
            <path d="M7 7h12v8H7z M7 17h5v2H7z M14 17h5v2h-5z" />
          </svg>
          <span className="Logomark-word">Rebuild</span>
        </button>
      </div>

      <div className="header-center">

        <div className="header-center-main">
          {centerContent || defaultCenterContent}
        </div>

        {/* 画面設計上、検索バーの下にもう1段（次へボタンや表示切り替えボタンなど）が必要な画面だけが渡してくる */}
        {secondaryRow && (
          <div className="header-center-secondary">
            {secondaryRow}
          </div>
        )}

      </div>

      <div className="space">

        <button className="header-text-button" type="button">
          <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6" />
          </svg>
          設定
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleProfileImageChange}
        />

        <button
          className="icon-button profile-button"
          onClick={openProfileImagePicker}
          disabled={isUploading}
          title="プロフィール画像を変更"
        >
          {user?.profileImageUrl ? (
            <img
              className="profile-avatar"
              src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImageUrl}`}
              alt="プロフィール画像"
            />
          ) : (
            <span className="profile-initial">
              {user?.username?.charAt(0) ?? ""}
            </span>
          )}
        </button>

        <button className="logout-button" onClick={logout}>
          ログアウト
        </button>

      </div>

    </div>
  );
}

export default Header
