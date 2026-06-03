import "./LeftMenu.css"

import { useNavigate } from "react-router-dom";


function LeftMenu() {

  const navigate = useNavigate();

    return (

        <div className="left-menu">

              <nav>

                <button
                  onClick={() =>
                    navigate("/home")
                  }
                >
                  Home <br />
                  - ホーム🏠 -
                </button>

                <button
                  onClick={() =>
                    navigate("/MemoPage")
                  }
                >
                  memo <br />
                  - メモ -
                </button>

                <button><br /><br /></button>


                <button
                  onClick={() =>
                    navigate("/TopicChoice")
                  }
                >
                  CreateManga <br />
                  - マンガ創作 -
                </button>

                <button
                  onClick={() =>
                    navigate("/StoryCreatePage")
                  }
                >
                  StoryCreate <br />
                  - ストーリー創作 -
                </button>

              </nav>

            </div>

    );
}

export default LeftMenu;