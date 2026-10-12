import "./LeftMenu.css"
import { useLocation, useNavigate } from "react-router-dom";

type MenuItem = {
  label: string;
  path: string;
  // 漫画創作は「ストーリー選択 → 編集」の2画面あるため、どちらにいても現在地として表示する
  activePaths: string[];
  icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
  {
    label: "ホーム",
    path: "/home",
    activePaths: ["/home"],
    icon: <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  },
  {
    label: "メモ",
    path: "/MemoPage",
    activePaths: ["/MemoPage"],
    icon: (
      <>
        <path d="M5.5 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12a.5.5 0 0 1-.5-.5z" />
        <path d="M9 11h6.5M9 14.5h6.5M9 7.5h3" />
      </>
    ),
  },
  {
    label: "ストーリー創作",
    path: "/StoryCreatePage",
    activePaths: ["/StoryCreatePage"],
    icon: (
      <>
        <path d="M12 6.5C10 5 7 4.5 4 5v13.5c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z" />
        <path d="M12 6.5V20" />
      </>
    ),
  },
  {
    label: "漫画創作",
    path: "/TopicChoice",
    activePaths: ["/TopicChoice", "/CreateMangaPage"],
    icon: (
      <>
        <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
        <path d="M4 10.5h16M11 10.5l-2 10M13 3.5v7" />
      </>
    ),
  },
];

function LeftMenu() {

  const navigate = useNavigate();
  const { pathname } = useLocation();

    return (

      <div className="left-menu">

        <nav aria-label="メインメニュー">

          {menuItems.map((item) => {
            const isActive = item.activePaths.includes(pathname);

            return (
              <button
                key={item.path}
                type="button"
                className={"left-menu-item" + (isActive ? " is-active" : "")}
                aria-current={isActive ? "page" : undefined}
                onClick={() => navigate(item.path)}
              >
                <svg className="left-menu-icon" viewBox="0 0 24 24" aria-hidden="true">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            );
          })}

        </nav>

      </div>

    );
}

export default LeftMenu;
