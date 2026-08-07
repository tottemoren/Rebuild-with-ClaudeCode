import "./MainLayout.css";

import Header from "../Header/Header";
import LeftMenu from "../LeftMenu/LeftMenu";
import Advertisement from "../RightMenu/Advertisement";

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Props) {

  return (

    <div className="app-wrapper">
      <div className="app-canvas">

        <div className="home-page">

          {/* TOP */}
          <Header/>

          {/* MAIN */}
          <div className="container">

            {/* LEFT MENU */}
            <LeftMenu/>

            {/* CENTER */}
            <div className="main-contents">
                {children}
            </div>

            {/* RIGHT MENU*/}
            <Advertisement/>

          </div>

        </div>
      
      </div>
    </div>

  );
}

export default MainLayout;