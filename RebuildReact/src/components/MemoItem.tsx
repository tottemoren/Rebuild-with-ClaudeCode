import type { Memo } from "../types/Memo"

type MemoItemProps = {
  memo: Memo
  onDelete: (id: number) => void
  onEdit: (memo: Memo) => void
}

function MemoItem({
  memo,
  onDelete,
  onEdit,
}: MemoItemProps) {

  return (
    <li className="memo-item">

      <div className="memo-item-header">
        <span className="memo-item-title">{memo.title}</span>

        <span className="memo-item-direction">
          {memo.writingDirection === "vertical" ? "縦書き" : "横書き"}
        </span>
      </div>

      <div
        className={
          "memo-item-body" +
          (memo.writingDirection === "vertical"
            ? " memo-item-body-vertical"
            : "")
        }
      >
        {memo.content}
      </div>

      <div className="memo-buttons">
        <button onClick={() => onEdit(memo)}>
          編集
        </button>

        <button onClick={() => onDelete(memo.id)}>
          削除
        </button>
      </div>

    </li>
  )
}

export default MemoItem
