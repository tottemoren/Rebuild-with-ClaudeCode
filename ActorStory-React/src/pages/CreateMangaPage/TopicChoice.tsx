import "./TopicChoice.css";

import { useNavigate } from "react-router-dom";
// import { useState } from "react";

function TopicChoice() {

  const navigate = useNavigate();

  // const [] = useState(false);

  return (

    <div className="topic-choice-page">

      {/* TOP */}
      <div className="topic-choice-top">

        <div className="LogomarkSpace">
          <img
            className="Logomark"
            src="/images/settingimages/ActarStoryRogo1.png"
            alt="logo"
          />
        </div>

        <div className="explanation">
          <h2>TopicChoice & CharacterChoice</h2>
        </div>

        <div className="space1"></div>


        <button className="set">
          - artist -
        </button>



        <div className="space2"></div>

        <div className="RankMatchScreenMove">

          <button
            onClick={() =>
              navigate("/CreateMangaPage")
            }
          >
            Next <br />
            - 次へ -
          </button>

        </div>

      </div>

      {/* MAIN */}
      <div className="topic-choice-container">

        {/* LEFT */}
        <div className="left-menu">

          <button
            onClick={() => navigate("/home")}
          >
            UserHome <br />
            - ユーザーホーム -
          </button>

        </div>

        {/* CENTER */}
        <div className="topic-choice-main">

          <div className="thema">

            <h3>【プロを名乗るなら】</h3>

            <p>
              俳優として成長していく主人公。
              しかしそこには立ちはだかる壁が
            </p>

            <p>
              ------------------------------------------------------------
            </p>

            <p>
              ジャンル 「職業」「天才」「葛藤」
            </p>

          </div>

          <div className="Reference-image-lines">

            <b>アリサ</b>

            <p>
              今の芝居は完璧とは言えないわね
            </p>

            <p>
              あなたにプロを名乗る資格はない
            </p><br/>

            <b>夜凪景</b>

            <p>
              もう一度やらせてください
            </p>

          </div>

          <div className="thema">

            <h3>【特別な映画】</h3>

            <p>
              ひょんなことから２人で映画を見に行くことに,,,
            </p>

            <p>
              ------------------------------------------------------------
            </p>

            <p>
              ジャンル 「恋愛」「緊張」「会話」
            </p>

          </div>

          <div className="thema">

            <h3>【3人で海に！】</h3>

            <p>
              仲良しの３人が久々の海に。
              そこで繰り広げられる会話とは！？
            </p>

            <p>
              ------------------------------------------------------------
            </p>

            <p>
              ジャンル 「海」「友人」「会話」
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="topic-choice-right-menu">

          <button className="artist">

            <img
              src="/images/ArtistName_UsazakiShiro/ArtistImages/0_UsazakiShiro.jpg"
              alt="artist"
            />

          </button>

          <button className="artist">

            <img
              src="/images/ArtistImages/0_AkutamiGege.jpg"
              alt="artist"
            />

          </button>

          <button className="artist">

            <img
              src="/images/ArtistImages/0_YamagutiTubasa.jpg"
              alt="artist"
            />

          </button>

        </div>

      </div>

    </div>
  );
}

export default TopicChoice;