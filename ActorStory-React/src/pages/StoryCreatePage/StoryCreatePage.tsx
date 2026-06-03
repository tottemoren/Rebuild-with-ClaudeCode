import "./StoryCreatePage.css";

import { useState } from "react";
import LayoutAdvertisementSimple from "../../components/layout/LayoutAdvertisementSimple";

type Line = {
  talkerName: string;
  linky: string;
};

function StoryCreatePage() {

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");

  const [categorize1, setCategorize1] = useState("");
  const [categorize2, setCategorize2] = useState("");
  const [categorize3, setCategorize3] = useState("");

  const [lines, setLines] = useState<Line[]>([]);

  const addLine = () => {

    setLines([
      ...lines,
      {
        talkerName: "",
        linky: "",
      },
    ]);
  };

  const removeLine = (index: number) => {

    setLines(
      lines.filter((_, i) => i !== index)
    );
  };

  return (

    <LayoutAdvertisementSimple

      headerContent={
        <div className="explanation-StoryCreatePage">

          <h3>
            あなたの好きなように物語を作成できます<br/>
          </h3>

          <p>
            左側がストーリー作成画面、右側が既存ストーリー閲覧画面
          </p>

        </div>
      }
    >


      <div className="story-create-page">

        <div className="story-container">

          {/* 左側 */}

          <div className="menu1">

            <div className="thema">

              <div>

                <label>タイトル</label>

                <input
                  type="text"
                  maxLength={13}
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />

              </div>

              <br />

              <div>

                <label>あらすじ</label>

                <textarea
                  maxLength={38}
                  rows={2}
                  value={synopsis}
                  onChange={(e) =>
                    setSynopsis(e.target.value)
                  }
                />

              </div>

              <p>
                --------------------------------
              </p>

              <div>

                <label>ジャンル</label>

                <input
                  value={categorize1}
                  onChange={(e) =>
                    setCategorize1(
                      e.target.value
                    )
                  }
                />

                <input
                  value={categorize2}
                  onChange={(e) =>
                    setCategorize2(
                      e.target.value
                    )
                  }
                />

                <input
                  value={categorize3}
                  onChange={(e) =>
                    setCategorize3(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="Reference-image-lines">

              <h3>
                キャラ名 + セリフ
              </h3>

              {lines.map((line, index) => (

                <div
                  key={index}
                  className="line-item"
                >

                  <label>
                    人物名
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    value={line.talkerName}
                    onChange={(e) => {

                      const copy =
                        [...lines];

                      copy[index]
                        .talkerName =
                        e.target.value;

                      setLines(copy);

                    }}
                  />

                  <label>
                    セリフ
                  </label>

                  <input
                    type="text"
                    maxLength={30}
                    value={line.linky}
                    onChange={(e) => {

                      const copy =
                        [...lines];

                      copy[index]
                        .linky =
                        e.target.value;

                      setLines(copy);

                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeLine(index)
                    }
                  >
                    削除
                  </button>

                </div>

              ))}

              <button
                type="button"
                onClick={addLine}
              >
                行を追加
              </button>

              <button type="button">
                登録
              </button>

            </div>

          </div>

          {/* 右側 */}

          <div className="menu2">

            <h2>
              作成済みストーリー
            </h2>

            <p>
              ここにAPIから取得した
              ストーリー一覧を表示予定
            </p>

          </div>

        </div>

      </div>

    </LayoutAdvertisementSimple>

  );
}

export default StoryCreatePage;