import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FolderStrip from './FolderStrip'
import type { Folder } from '../../../types/Folder'

const folders: Folder[] = [
  { id: 1, name: '灯（あかり）', userId: 1 },
  { id: 2, name: '背景', userId: 1 },
]

describe('FolderStrip', () => {
  test('フォルダ名が、各フォルダのボタンの中に表示される', () => {
    render(<FolderStrip folders={folders} coverUrls={{}} selectedFolderId={null} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: '灯（あかり）' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '背景' })).toBeInTheDocument()
  })

  test('選択中のフォルダだけが押された状態になる', () => {
    render(<FolderStrip folders={folders} coverUrls={{}} selectedFolderId={2} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: '背景' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '灯（あかり）' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('素材があるフォルダは1枚目を表紙にし、無いフォルダはアイコンを出す', () => {
    const { container } = render(
      <FolderStrip
        folders={folders}
        coverUrls={{ 1: '/uploads/materials/1/cover.png' }}
        selectedFolderId={null}
        onSelect={vi.fn()}
      />
    )

    const covers = container.querySelectorAll('.FolderStrip-cover img')
    expect(covers).toHaveLength(1)
    expect(covers[0].getAttribute('src')).toContain('/uploads/materials/1/cover.png')
    expect(screen.getAllByTestId('folder-cover-icon')).toHaveLength(1)
  })

  test('フォルダを押すと、そのフォルダのIDが渡される', async () => {
    const onSelect = vi.fn()
    render(<FolderStrip folders={folders} coverUrls={{}} selectedFolderId={1} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('button', { name: '背景' }))

    expect(onSelect).toHaveBeenCalledWith(2)
  })

  test('フォルダが1つも無いときは、作り方の案内を出す', () => {
    render(<FolderStrip folders={[]} coverUrls={{}} selectedFolderId={null} onSelect={vi.fn()} />)

    expect(screen.getByText(/ストーリー選択画面で作成できます/)).toBeInTheDocument()
  })
})
