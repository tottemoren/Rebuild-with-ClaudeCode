import "./Header.css"

import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import useLoginUser from "../../../hooks/useLoginUser";
import type { User } from "../../../types/User";
import { highlightExactMatches } from "../../../utils/searchHighlight";

function Header() {

  const navigate = useNavigate();

  const [user, setUser] = useState<User>(useLoginUser());
  const [isUploading, setIsUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const logout = () => {

    localStorage.removeItem(
      "loginUser"
    );

    alert(
      "ログアウトしました"
    );

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
        `http://localhost:8080/api/users/${user.id}/profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {

        const updatedUser: User = await response.json();

        setUser(updatedUser);

        localStorage.setItem(
          "loginUser",
          JSON.stringify(updatedUser)
        );

      } else {

        alert("プロフィール画像のアップロードに失敗しました");
      }

    } catch {

      alert("プロフィール画像のアップロードに失敗しました（通信エラー）");

    } finally {

      setIsUploading(false);
    }
  };

    return (
        <div className="HomePagetop">

            <div className="LogomarkSpace">
              <img
                className="Logomark"
                src="/images/settingimages/RebuildRogo1.png"
                alt="logo"
              />
            </div>

            <div className="header-center">

              <input
                type="text"
                placeholder="検索..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button
                className="modern-button search-button"
                onClick={handleSearch}
              >
                検索
              </button>

            </div>

            <div className="space">

              <button className="icon-button" title="設定">
              ⚙
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
                    src={`http://localhost:8080${user.profileImageUrl}`}
                    alt="プロフィール画像"
                  />
                ) : (
                  "👤"
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