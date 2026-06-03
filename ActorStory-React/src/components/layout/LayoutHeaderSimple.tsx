import "./Layout.css";

import LeftMenu from "./LeftMenu/LeftMenu";
import HeaderSimple from "./Header/HeaderSimple";

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
          <HeaderSimple
            centerContent={headerContent}
          />

          {/* MAIN */}
          <div className="container">

            {/* LEFT MENU */}
            <LeftMenu/>

            {/* CENTER */}
            <div
              className="main-contents"
            >
                {children}

            </div>

          </div>

        </div>
      
      </div>
    </div>

  );
}

export default LayoutHeaderSimple;