
import { useState } from "react";


function RightMenuKoma() {

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



    return(

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

    )

}

export default RightMenuKoma;