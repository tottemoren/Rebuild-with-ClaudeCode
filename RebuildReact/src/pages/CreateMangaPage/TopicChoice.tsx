import "./TopicChoice.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import LayoutHeaderSimple from "../../components/layout/PageLayouts/NoRightMenu/NoRightAndSimpleHeader";
import useLoginUser from "../../hooks/useLoginUser";
import type { Folder } from "../../types/Folder";
import type { Material } from "../../types/Material";
import type { Story } from "../../types/Story";
import type { Dialogue } from "../../types/Dialogue";

function TopicChoice() {

  const navigate = useNavigate();
  const loginUser = useLoginUser();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);
  const [hoveredStoryId, setHoveredStoryId] = useState<number | null>(null);
  const [hoveredDialogues, setHoveredDialogues] = useState<Dialogue[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchStories = () => {
    fetch("http://localhost:8080/stories")
      .then((response) => response.json())
      .then((data) => setStories(data));
  };

  const handleStoryHover = (storyId: number) => {

    setHoveredStoryId(storyId);

    fetch(`http://localhost:8080/dialogues?storyId=${storyId}`)
      .then((response) => response.json())
      .then((data) => setHoveredDialogues(data));
  };

  const handleNext = () => {

    if (selectedStoryId === null) {
      return;
    }

    const params = new URLSearchParams();
    params.set("storyId", String(selectedStoryId));

    if (selectedFolderId !== null) {
      params.set("folderId", String(selectedFolderId));
    }

    navigate(`/CreateMangaPage?${params.toString()}`);
  };

  const fetchFolders = () => {
    fetch(`http://localhost:8080/api/folders?userId=${loginUser.id}`)
      .then((response) => response.json())
      .then((data) => setFolders(data));
  };

  useEffect(() => {
    fetchFolders();
    fetchStories();
  }, []);

  const fetchMaterials = (folderId: number) => {
    fetch(`http://localhost:8080/api/folders/${folderId}/materials`)
      .then((response) => response.json())
      .then((data) => setMaterials(data));
  };

  const createFolder = () => {

    if (!newFolderName.trim()) {
      return;
    }

    fetch("http://localhost:8080/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFolderName,
        userId: loginUser.id,
      }),
    })
      .then(() => {
        setNewFolderName("");
        fetchFolders();
      });
  };

  const deleteFolder = (id: number) => {

    fetch(`http://localhost:8080/api/folders/${id}`, {
      method: "DELETE",
    }).then((response) => {

      if (response.status === 409) {
        alert("フォルダ内に素材が残っているため削除できません。先に中の素材を削除してください。");
        return;
      }

      if (selectedFolderId === id) {
        setSelectedFolderId(null);
        setMaterials([]);
      }

      fetchFolders();
    });
  };

  const selectFolder = (id: number) => {

    if (selectedFolderId === id) {
      setSelectedFolderId(null);
      setMaterials([]);
      return;
    }

    setSelectedFolderId(id);
    fetchMaterials(id);
  };

  const openUploadPicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || selectedFolderId === null) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    fetch(`http://localhost:8080/api/folders/${selectedFolderId}/materials`, {
      method: "POST",
      body: formData,
    })
      .then(() => fetchMaterials(selectedFolderId))
      .finally(() => setIsUploading(false));
  };

  const deleteMaterial = (id: number) => {

    fetch(`http://localhost:8080/api/materials/${id}`, {
      method: "DELETE",
    }).then(() => {

      if (selectedFolderId !== null) {
        fetchMaterials(selectedFolderId);
      }
    });
  };

  return (

    <LayoutHeaderSimple

      headerContent={

        <div className="TopicChoice-top">

          <div className="explanation">
            <h2>TopicChoice & CharacterChoice</h2>
          </div>

          <div className="space1"></div>

          <button className="set">
            - artist -
          </button>

          <div className="space2"></div>

          <button
            className="TopicChoice-next"
            onClick={handleNext}
            disabled={selectedStoryId === null}
          >
            Next <br />
            - 次へ -
          </button>

        </div>
      }
    >

      <div className="TopicChoice-body">

        {/* CENTER */}
        <div className="topic-choice-main">

          {stories.length === 0 && (
            <p className="topic-choice-empty">
              ストーリーがありません。先にストーリー創作画面で作成してください。
            </p>
          )}

          {stories.map((story) => (

            <div key={story.id}>

              <div
                className={
                  "topic-choice-thema" +
                  (selectedStoryId === story.id ? " selected" : "")
                }
                onClick={() => setSelectedStoryId(story.id)}
                onMouseEnter={() => handleStoryHover(story.id)}
                onMouseLeave={() => setHoveredStoryId(null)}
              >

                <h3>{story.title || "（無題）"}</h3>

                <p>
                  {story.summary}
                </p>

                <p>
                  ------------------------------------------------------------
                </p>

                <p>
                  ジャンル {story.genre}
                </p>

              </div>

              {hoveredStoryId === story.id && (

                <div className="topic-choice-Reference-image-lines">

                  {hoveredDialogues.length === 0 && (
                    <p>セリフがありません</p>
                  )}

                  {hoveredDialogues.map((dialogue) => (
                    <div key={dialogue.id}>

                      <b>{dialogue.talkerName}</b>

                      <p>{dialogue.line}</p>

                    </div>
                  ))}

                </div>

              )}

            </div>

          ))}

        </div>

        {/* RIGHT：素材フォルダ */}
        <div className="topic-choice-right-menu">

          <div className="folder-new-row">
            <input
              type="text"
              className="folder-new-input"
              placeholder="新規フォルダ名"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button
              type="button"
              className="folder-new-button"
              onClick={createFolder}
            >
              追加
            </button>
          </div>

          <div className="folder-list">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={
                  "folder-card" +
                  (selectedFolderId === folder.id ? " selected" : "")
                }
              >
                <button
                  type="button"
                  className="folder-card-name"
                  onClick={() => selectFolder(folder.id)}
                >
                  📁 {folder.name}
                </button>

                <button
                  type="button"
                  className="folder-card-delete"
                  onClick={() => deleteFolder(folder.id)}
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          {selectedFolderId !== null && (

            <div className="material-panel">

              <div className="material-panel-header">
                <span>素材一覧</span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleUpload}
                />

                <button
                  type="button"
                  className="material-upload-button"
                  onClick={openUploadPicker}
                  disabled={isUploading}
                >
                  {isUploading ? "アップロード中..." : "＋ 追加"}
                </button>
              </div>

              <div className="material-grid">
                {materials.length === 0 && (
                  <div className="material-empty">素材がありません</div>
                )}

                {materials.map((material) => (
                  <div key={material.id} className="material-thumb">
                    <img
                      src={`http://localhost:8080${material.url}`}
                      alt={material.fileName}
                    />
                    <button
                      type="button"
                      className="material-thumb-delete"
                      onClick={() => deleteMaterial(material.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

            </div>

          )}

        </div>

      </div>

    </LayoutHeaderSimple>
  );
}

export default TopicChoice;
