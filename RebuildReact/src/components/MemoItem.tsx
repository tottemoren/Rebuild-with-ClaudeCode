type MemoProps = {
  id: number
  text: string
  onDelete: (id: number) => void
  onEdit: (memo: { id: number; text: string }) => void
}

function MemoItem({
  id,
  text,
  onDelete,
  onEdit,
}: MemoProps) {

  return (
    <li className="memo-item">
        
      <span>{text}</span>

      <div className="memo-buttons">
        <button
          onClick={() =>
            onEdit({ id, text })
          }
        >
          編集
        </button>

        <button
          onClick={() => onDelete(id)}
        >
          削除
        </button>

      </div>

    </li>
  )
}

export default MemoItem