// 右メニュー：選択中のキャラクターのコマ素材一覧。
// ドラッグ元となる画像を表示するだけの、状態を持たないコンポーネントにした。
// どのキャラクターを表示するか（selectedCharacter）と
// ドラッグ開始時の処理（onDragStart）は親（CreateMangaPage）から受け取る。

export type CharacterKey = "yonagi" | "arisa" | "nagisa";

type RightMenuKomaProps = {
  selectedCharacter: CharacterKey;
  onDragStart: (
    event: React.DragEvent<HTMLImageElement>,
    imageSrc: string
  ) => void;
};

const characterImages: Record<CharacterKey, string[]> = {
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
    "/images/ArtistName_UsazakiShiro/CharacterAndKomaImages/SatukiNagisa_1/1.png",
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
