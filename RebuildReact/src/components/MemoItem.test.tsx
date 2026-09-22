import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemoItem from './MemoItem'
import type { Memo } from '../types/Memo'

const baseMemo: Memo = {
  id: 1,
  title: 'テストタイトル',
  content: 'テスト本文',
  writingDirection: 'horizontal',
}

describe('MemoItem', () => {
  test('タイトルと本文が表示される', () => {
    render(<MemoItem memo={baseMemo} onDelete={vi.fn()} onEdit={vi.fn()} />)

    expect(screen.getByText('テストタイトル')).toBeInTheDocument()
    expect(screen.getByText('テスト本文')).toBeInTheDocument()
  })

  test('writingDirectionがhorizontalなら「横書き」と表示される', () => {
    render(<MemoItem memo={baseMemo} onDelete={vi.fn()} onEdit={vi.fn()} />)

    expect(screen.getByText('横書き')).toBeInTheDocument()
  })

  test('writingDirectionがverticalなら「縦書き」と表示される', () => {
    const verticalMemo: Memo = { ...baseMemo, writingDirection: 'vertical' }
    render(<MemoItem memo={verticalMemo} onDelete={vi.fn()} onEdit={vi.fn()} />)

    expect(screen.getByText('縦書き')).toBeInTheDocument()
  })

  test('編集ボタンを押すとonEditがmemoを引数に呼ばれる', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<MemoItem memo={baseMemo} onDelete={vi.fn()} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: '編集' }))

    expect(onEdit).toHaveBeenCalledWith(baseMemo)
  })

  test('削除ボタンを押すとonDeleteがidを引数に呼ばれる', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<MemoItem memo={baseMemo} onDelete={onDelete} onEdit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '削除' }))

    expect(onDelete).toHaveBeenCalledWith(baseMemo.id)
  })
})