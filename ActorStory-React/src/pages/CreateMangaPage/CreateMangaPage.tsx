import "./CreateMangaPage.css";

import { useState } from "react";
import LayoutHeaderSimple from "../../components/layout/LayoutHeaderSimple";


export default function CreateMangaPage() {
  
const [selectedCharacter, setSelectedCharacter] =
  useState<"yonagi" | "arisa" | "nagisa">("yonagi");

  const characterImages = {
    yonagi: [
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/1.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/2.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/3.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/4.png",
    ],

    arisa: [
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/1.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/2.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/3.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/4.png",
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/5.png",
    ],

    nagisa: [
      "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/SatukiNagisa_1/0_SatsukiNagisa.png",
    ],
  };

  /* ======================================
     Drag　(TypeScriptのコードになってるので後でReactに直す)
  ====================================== */

const drag = (event: React.DragEvent<HTMLImageElement>) => {
  event.dataTransfer.setData("src", event.currentTarget.src);
};

const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
};

const drop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();

  const src = event.dataTransfer.getData("src");

  const img = document.createElement("img");
  img.src = src;
  img.className = "basic";

  event.currentTarget.appendChild(img);
};



  return (

    <LayoutHeaderSimple

      headerContent={

        <>

          <div className="CreateMangaPage-thema">
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

          {/* キャラ選択 */}
          <div className="CreateMangaPage-character">

            <button
              type="button"
              onClick={() => setSelectedCharacter("yonagi")}
            >
              <img
                src="/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/YonagiKei_1/0_Yonagikei.png"
                alt="Yonagi"
              />
            </button>

            <button
              type="button"
              onClick={() => setSelectedCharacter("arisa")}
            >
              <img
                src="/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/HosiArisa_1/0_HosiArisa.png"
                alt="Arisa"
              />
            </button>

            <button
              type="button"
              onClick={() => setSelectedCharacter("nagisa")}
            >
              <img
                src="/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/SatukiNagisa_1/0_SatsukiNagisa.png"
                alt="Nagisa"
              />
            </button>

          </div>

        </>
      }
    >




      {/* 中央 */}
      <div
        className="CreateMangaPage-left"
        onDrop={drop}
        onDragOver={allowDrop}
      >
        <img
          className="blankpaper"
          src="/images/settingimages/blankpaper.png"
          alt="blankpaper"
        />
      </div>

      {/* 右 */}
      <div
        className="CreateMangaPage-right"
        onDrop={drop}
        onDragOver={allowDrop}
      >

        {characterImages[selectedCharacter].map((image, index) => (
          <img
            key={index}
            className="basic"
            src={image}
            alt={`character-${index}`}
            draggable="true"
            onDragStart={drag}
          />
        ))}

      </div>

    </LayoutHeaderSimple>

  );
}