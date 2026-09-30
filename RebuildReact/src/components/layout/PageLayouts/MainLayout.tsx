import "./MainLayout.css";

import Header from "../Header/Header";
import LeftMenu from "../LeftMenu/LeftMenu";
import Advertisement from "../RightMenu/Advertisement";

type Props = {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  headerSecondaryContent?: React.ReactNode;
  showAdvertisement?: boolean;
};

function MainLayout({
  children,
  headerContent,
  headerSecondaryContent,
  showAdvertisement = true,
}: Props) {

  return (

    <div className="app-wrapper">
      <div className="app-canvas">

        <div className="home-page">

          {/* TOP */}
          <Header
            centerContent={headerContent}
            secondaryRow={headerSecondaryContent}
          />

          {/* MAIN */}
          <div className="container">

            {/* LEFT MENU */}
            <LeftMenu/>

            {/* CENTER */}
            <div
              className={
                "main-contents" +
                (showAdvertisement ? "" : " main-contents-full")
              }
            >
                {children}
            </div>

            {/* RIGHT MENU（広告が不要な画面はshowAdvertisement={false}で非表示にできる） */}
            {showAdvertisement && <Advertisement/>}

          </div>

        </div>

      </div>
    </div>

  );
}

export default MainLayout;