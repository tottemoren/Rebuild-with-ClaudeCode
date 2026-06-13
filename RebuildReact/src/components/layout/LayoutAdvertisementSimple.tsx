import "./Layout.css";

import Header from "./Header/Header";
import LeftMenu from "./LeftMenu/LeftMenu";

type Props = {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
};

function LayoutAdvertisementSimple({ children,headerContent }: Props) {

  return (

    <div className="app-wrapper">
      <div className="app-canvas">

        <div className="home-page">

          {/* TOP */}
          <Header
            centerContent={headerContent}
          />

          {/* MAIN */}
          <div className="container">

            {/* LEFT MENU */}
            <LeftMenu/>

            {/* CENTER */}
            <div
              className="LayoutAdvertisementSimple-maincontents"
            >
                {children}

            </div>

          </div>

        </div>
      
      </div>
    </div>

  );
}

export default LayoutAdvertisementSimple;