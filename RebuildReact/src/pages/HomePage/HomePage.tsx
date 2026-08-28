import { useEffect, useState } from "react"
import "./HomePage.css"
import MainLayout from "../../components/layout/PageLayouts/MainLayout"
import type { Memo } from "../../types/Memo"
import type { Story } from "../../types/Story"

type ContentView = "memo" | "story"

function HomePage() {

  const [view, setView] = useState<ContentView>("memo")
  const [memos, setMemos] = useState<Memo[]>([])
  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    fetch("http://localhost:8080/api/memos")
      .then((response) => response.json())
      .then((data) => setMemos(data))

    fetch("http://localhost:8080/stories")
      .then((response) => response.json())
      .then((data) => setStories(data))
  }, [])

  // 更新日時カラムがまだ無いため、idの降順（作成が新しい順に近似）で表示する
  const sortedMemos = [...memos].sort((a, b) => b.id - a.id)
  const sortedStories = [...stories].sort((a, b) => b.id - a.id)

  return (

    <MainLayout>

      <div className="home-page-content">

        <div className="home-page-toggle">
          <button
            className={
              "home-page-toggle-button" +
              (view === "memo" ? " active" : "")
            }
            onClick={() => setView("memo")}
          >
            メモ
          </button>

          <button
            className={
              "home-page-toggle-button" +
              (view === "story" ? " active" : "")
            }
            onClick={() => setView("story")}
          >
            ストーリー
          </button>
        </div>

        {view === "memo" && (
          <ul className="home-page-card-list">
            {sortedMemos.length === 0 && (
              <li className="home-page-empty">メモがありません</li>
            )}

            {sortedMemos.map((memo) => (
              <li key={memo.id} className="home-page-card">
                <div className="home-page-card-title">
                  {memo.title || "（無題）"}
                </div>
                <div className="home-page-card-preview">
                  {memo.content}
                </div>
              </li>
            ))}
          </ul>
        )}

        {view === "story" && (
          <ul className="home-page-card-list">
            {sortedStories.length === 0 && (
              <li className="home-page-empty">ストーリーがありません</li>
            )}

            {sortedStories.map((story) => (
              <li key={story.id} className="home-page-card">
                <div className="home-page-card-title">
                  {story.title || "（無題）"}
                </div>
                <div className="home-page-card-preview">
                  {story.summary}
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>

    </MainLayout>

  )
}

export default HomePage
