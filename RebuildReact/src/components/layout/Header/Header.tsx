import "./Header.css"

type HeaderProps = {
  centerContent?: React.ReactNode;
};

function Header({
  centerContent
}: HeaderProps) {

    return (
        <div className="HomePagetop">

            <div className="LogomarkSpace">
              <img
                className="Logomark"
                src="/images/settingimages/RebuildRogo1.png"
                alt="logo"
              />
            </div>

            <div className="header-center">        
              {centerContent}
            </div>

            <div className="space">

              <input
                type="text"
                placeholder="検索..."
                className="search-input"
              />
              <button className="modern-button search-button">
                検索
              </button>

              <button className="modern-button icon-button">
              ⚙
              </button>

              <button className="modern-button icon-button">
                👤
              </button>

            </div>

          </div>

    );

}

export default Header