import "./Header.css"

type HeaderProps = {
  centerContent?: React.ReactNode;
};

function HeaderSimple({
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

            <div className="header-center-simple">        
              {centerContent}
            </div>

        </div>

    );

}

export default HeaderSimple