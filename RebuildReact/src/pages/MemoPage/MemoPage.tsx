import { useEffect, useState } from 'react'
import './MemoPage.css'
import MemoItem from '../../components/MemoItem'
import MainLayout from "../../components/layout/PageLayouts/MainLayout"
import type { Memo, WritingDirection } from '../../types/Memo'

function MemoPage() {

  const [title, setTitle] = useState('')
  const [horizontalContent, setHorizontalContent] = useState('')
  const [verticalContent, setVerticalContent] = useState('')

  const [memos, setMemos] = useState<Memo[]>([])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDirection, setEditingDirection] =
    useState<WritingDirection | null>(null)

  useEffect(() => {
    fetchMemos()
  }, [])

  const fetchMemos = () => {
    fetch('http://localhost:8080/api/memos')
      .then((response) => response.json())
      .then((data) => setMemos(data))
  }

  const resetForm = () => {
    setTitle('')
    setHorizontalContent('')
    setVerticalContent('')
    setEditingId(null)
    setEditingDirection(null)
  }

  const saveMemo = (direction: WritingDirection) => {

    const content =
      direction === 'horizontal' ? horizontalContent : verticalContent

    if (!title.trim() || !content.trim()) {
      return
    }

    const isUpdating =
      editingId !== null && editingDirection === direction

    const url = isUpdating
      ? `http://localhost:8080/api/memos/${editingId}`
      : 'http://localhost:8080/api/memos'

    const method = isUpdating ? 'put' : 'post'

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        content: content,
        writingDirection: direction,
      })
    })
      .then(() => fetchMemos())
      .then(() => resetForm())
  }

  const startEdit = (memo: Memo) => {
    setTitle(memo.title)

    if (memo.writingDirection === 'vertical') {
      setVerticalContent(memo.content)
      setHorizontalContent('')
    } else {
      setHorizontalContent(memo.content)
      setVerticalContent('')
    }

    setEditingId(memo.id)
    setEditingDirection(memo.writingDirection)
  }

  const deleteMemo = (id: number) => {
    fetch(`http://localhost:8080/api/memos/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetchMemos())
      .then(() => {
        if (editingId === id) {
          resetForm()
        }
      })
  }

  return (

    <MainLayout>

      <div className="memo-page">

        <h1 className="memo-page-heading">メモ</h1>

        <div className="memo-page-title-row">
          <input
            className="memo-page-title-input"
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="memo-page-composer-row">

          <div className="memo-page-composer">
            <div className="memo-page-composer-heading">横書きメモ</div>

            <textarea
              className="memo-page-textarea memo-page-textarea-horizontal"
              placeholder="横書きで入力"
              value={horizontalContent}
              onChange={(e) => setHorizontalContent(e.target.value)}
            />

            <button
              className="memo-page-save-button"
              onClick={() => saveMemo('horizontal')}
            >
              {editingId !== null && editingDirection === 'horizontal'
                ? '更新'
                : '保存'}
            </button>
          </div>

          <div className="memo-page-composer">
            <div className="memo-page-composer-heading">縦書きメモ</div>

            <textarea
              className="memo-page-textarea memo-page-textarea-vertical"
              placeholder="縦書きで入力"
              value={verticalContent}
              onChange={(e) => setVerticalContent(e.target.value)}
            />

            <button
              className="memo-page-save-button"
              onClick={() => saveMemo('vertical')}
            >
              {editingId !== null && editingDirection === 'vertical'
                ? '更新'
                : '保存'}
            </button>
          </div>

        </div>

        <ul className="memo-page-list">
          {memos.map((memo) => (
            <MemoItem
              key={memo.id}
              memo={memo}
              onDelete={deleteMemo}
              onEdit={startEdit}
            />
          ))}
        </ul>

      </div>

    </MainLayout>

  )
}

export default MemoPage
