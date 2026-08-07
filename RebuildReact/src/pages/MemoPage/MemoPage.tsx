import { useEffect, useState } from 'react'
import './MemoPage.css'
import MemoItem from '../../components/MemoItem'
import MainLayout from "../../components/layout/PageLayouts/MainLayout";


function Memo() {
  const [text, setText] = useState('')
  // const [memos, setMemos] = useState<string[]>([])
  const [memos, setMemos] = useState<Memo[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)

  type Memo = {
    id: number
    text: string
  }

  useEffect(() => {
    fetch('http://localhost:8080/api/memos')
      .then((response) => response.json())
      .then((data) => setMemos(data))
  }, [])

  // useEffect(() => {
  //   const savedMemos = localStorage.getItem('memos')

  //   if (savedMemos) {
  //     setMemos(JSON.parse(savedMemos))
  //   }
  // }, [])　　localstorageに保存する機能

  const addMemo = () => {

    const url = 
      editingId === null
        ? 'http://localhost:8080/api/memos'
        : `http://localhost:8080/api/memos/${editingId}`

    const method = 
      editingId === null
        ? 'post'
        : 'put'

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text
      })
    })
      .then(() =>
        fetch('http://localhost:8080/api/memos')
      )
      .then((response) => response.json())
      .then((data) => {
        setMemos(data)
        setText('')
        setEditingId(null)
      })
  }

  const startEdit = (memo: Memo) => {
    setText(memo.text)
    setEditingId(memo.id)
  }

  // const deleteMemo = (index: number) => {
  //   const newMemos = memos.filter((_, i) => i !== index)
  //   setMemos(newMemos)
  // }
  const deleteMemo = (id: number) => {
    fetch(`http://localhost:8080/api/memos/${id}`, {
      method: 'DELETE',
    })
      .then(() =>
        fetch('http://localhost:8080/api/memos')
      )
      .then((response) => response.json())
      .then((data) => setMemos(data))
  }

  // useEffect(() => {
  //   localStorage.setItem('memos', JSON.stringify(memos))
  // }, [memos])　　localstorageに保存する機能

  return (

    <MainLayout>


      <div className="app">
        <h1>メモアプリ</h1>

        <div className="input-area">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={addMemo}>追加</button>
        </div>

        <ul>
          {/* {memos.map((memo, index) => ( 
            <li key={index}>
              {memo.text}
              <button onClick={() => startEdit(memo)}>
                編集
              </button>

              <button onClick={() => deleteMemo(index)}>  
              <button onClick={() => deleteMemo(memo.id)}>
                削除
              </button>
            </li>  */}
          {memos.map((memo) => (
            <MemoItem
            key={memo.id}
            id={memo.id}
            text={memo.text}
            onDelete={deleteMemo}
            onEdit={startEdit}
            />
          ))}
        </ul>

      </div>

    </MainLayout>

  )
}

export default Memo