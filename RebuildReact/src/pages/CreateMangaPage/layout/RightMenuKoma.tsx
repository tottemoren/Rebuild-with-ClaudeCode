// 右メニュー：選択中のキャラクターのコマ素材一覧。
// ドラッグ元となる画像を表示するだけの、状態を持たないコンポーネントにした。
// どのキャラクターを表示するか（selectedCharacter）と
// ドラッグ開始時の処理（onDragStart）は親（CreateMangaPage）から受け取る。

export type CharacterKey = "hiiragi" | "amano" | "kisaragi";

type RightMenuKomaProps = {
  selectedCharacter: CharacterKey;
  onDragStart: (
    event: React.DragEvent<HTMLImageElement>,
    imageSrc: string
  ) => void;
};

const characterImages: Record<CharacterKey, string[]> = {
  hiiragi: [
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/HiiragiRen_1/1.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/HiiragiRen_1/2.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/HiiragiRen_1/3.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/HiiragiRen_1/4.png",
  ],

  amano: [
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/AmanoYui_1/1.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/AmanoYui_1/2.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/AmanoYui_1/3.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/AmanoYui_1/4.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/AmanoYui_1/5.png",
  ],

  kisaragi: [
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/1.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/2.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/3.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/4.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/5.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/6.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/7.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/8.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/9.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/10.png",
    "/images/ArtistName_TsukishiroKaede/CharacterAndKomaImages/KisaragiMioko_1/11.png",
  ],
};

function RightMenuKoma({
  selectedCharacter,
  onDragStart,
}: RightMenuKomaProps) {
  return (
    <div className="CreateMangaPage-right">
      {characterImages[selectedCharacter].map((image, index) => (
        <img
          key={image}
          className="basic"
          src={image}
          alt={`character-koma-${index}`}
          draggable="true"
          onDragStart={(event) => onDragStart(event, image)}
        />
      ))}
    </div>
  );
}

export default RightMenuKoma;
