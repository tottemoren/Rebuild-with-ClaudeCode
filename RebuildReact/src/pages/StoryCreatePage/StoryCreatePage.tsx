import "./StoryCreatePage.css";

import { useEffect, useState } from "react";
import type { Story } from "../../types/Story";
import LayoutAdvertisementSimple from "../../components/layout/PageLayouts/NoRightMenu/NoRightMenu";
import useLoginUser from "../../hooks/useLoginUser";
import type { Dialogue } from "../../types/Dialogue";


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
  const [stories, setStories] = useState<Story[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const loginUser = useLoginUser();

  const addLine = () => {

    setLines([
      ...lines,
      {
        talkerName: "",
        linky: "",
      },
    ]);
  };


  useEffect(() => {

    fetchStories();

  }, []);

  const fetchStories = async () => {

    const response =
      await fetch(
        "http://localhost:8080/stories"
      );

    const data =
      await response.json();

    setStories(data);

  };

  const fetchDialogues = async (storyId: number) => {

    const response =
      await fetch(
        "http://localhost:8080/dialogues?storyId="
        + storyId
      );

    const data =
      await response.json();

    setDialogues(data);

  };

  const handleStoryClick =
    async (storyId: number) => {

      if (
        selectedStoryId === storyId
      ) {

        setSelectedStoryId(null);

        return;

      }

      await fetchDialogues(storyId);

      setSelectedStoryId(storyId);

  };

  const createStory = async () => {

    const genre =
      categorize1 +
      " " +
      categorize2 +
      " " +
      categorize3;

    const response =
      await fetch(
        "http://localhost:8080/stories",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            title: title,

            summary: synopsis,

            genre: genre,

            userId:
              loginUser.id

          })

        }
      );

    if (response.ok) {

      const savedStory =
        await response.json();

      for (let index = 0; index < lines.length; index++) {

        const line = lines[index];

        await fetch(
          "http://localhost:8080/dialogues",
          {

            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({

              storyId: savedStory.id,

              orderNo: index + 1,

              talkerName: line.talkerName,

              line: line.linky

            })
          }
        );
      }

      await fetchStories();

      alert(
        "ストーリーを登録しました"
      );

    } else {

      alert(
        "登録に失敗しました"
      );

    }

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

              <button type="button" onClick={createStory}>
                登録
              </button>

            </div>

          </div>

          {/* 右側 */}

          <div className="menu2">

            <h2>
              作成済みストーリー
            </h2>

            {stories.map((story) => (

              <div
                key={story.id}
                className="story-block"
              >

                <h3>
                  {story.title}
                </h3>

                <p>
                  {story.summary}
                </p>

                <p>
                  {story.genre}
                </p>

                <button onClick={() => handleStoryClick(story.id)} >
                  {
                    selectedStoryId === story.id
                      ? "閉じる"
                      : "詳細を見る"
                  }
                </button>

                {
                  selectedStoryId === story.id && (

                    <div className="line-block">

                      {dialogues.map((dialogue) => (

                        <div key={dialogue.id}>

                          <strong>
                            {dialogue.talkerName}
                          </strong>

                          <p>
                            {dialogue.line}
                          </p>

                        </div>

                      ))}

                    </div>

                  )
                }

              </div>

            ))}



          </div>

        </div>

      </div>

    </LayoutAdvertisementSimple>

  );
}

export default StoryCreatePage;