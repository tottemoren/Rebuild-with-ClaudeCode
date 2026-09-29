import "../MainLayout.css";

import LeftMenu from "../../LeftMenu/LeftMenu";
import Header from "../../Header/Header";

type Props = {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
};

function LayoutHeaderSimple({ children,headerContent }: Props) {

  return (

    <div className="app-wrapper">
      <div className="app-canvas">

        <div className="home-page">

          {/* TOP */}
          {/* この画面群（TopicChoice/CreateMangaPage）では検索・アカウントメニューは不要なため非表示にする */}
          <Header
            centerContent={headerContent}
            showAccountMenu={false}
          />

          {/* MAIN */}
          <div className="container">

            {/* LEFT MENU */}
            <LeftMenu/>

            {/* CENTER */}
            <div className="main-contents">
                {children}
            </div>

          </div>

        </div>
      
      </div>
    </div>

  );
}

export default LayoutHeaderSimple;