import "./Layout.css";

import Header from "./Header/Header";
import LeftMenu from "./LeftMenu/LeftMenu";
import Advertisement from "./Advertisement/Advertisement";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {

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
            <div
              className="main-contents"
            >
                {children}

            </div>

            {/* RIGHT */}
            <Advertisement/>

          </div>

        </div>
      
      </div>
    </div>

  );
}

export default Layout;