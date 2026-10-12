import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MaterialPalette from './MaterialPalette'
import type { Material } from '../../../types/Material'

const materials: Material[] = [
  { id: 10, folderId: 1, fileName: '正面.png', url: '/uploads/materials/1/front.png' },
  { id: 11, folderId: 1, fileName: '横顔.png', url: '/uploads/materials/1/side.png' },
]

describe('MaterialPalette', () => {
  test('選択中フォルダの名前と素材が表示される', () => {
    render(<MaterialPalette folderName="灯（あかり）" materials={materials} onDragStart={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '灯（あかり）' })).toBeInTheDocument()
    expect(screen.getByText('2 点')).toBeInTheDocument()
    expect(screen.getByAltText('正面.png')).toBeInTheDocument()
    expect(screen.getByAltText('横顔.png')).toBeInTheDocument()
  })

  test('素材が無いフォルダでは、追加方法の案内を出す', () => {
    render(<MaterialPalette folderName="背景" materials={[]} onDragStart={vi.fn()} />)

    expect(screen.getByText(/ストーリー選択画面で追加できます/)).toBeInTheDocument()
  })

  test('フォルダが選ばれていないときは、選び方の案内を出す', () => {
    render(<MaterialPalette folderName={null} materials={[]} onDragStart={vi.fn()} />)

    expect(screen.getByText(/上のフォルダを選ぶと/)).toBeInTheDocument()
  })

  test('ドラッグを始めると、サーバー名を含まない素材の住所を渡す', () => {
    const onDragStart = vi.fn()
    render(<MaterialPalette folderName="灯（あかり）" materials={materials} onDragStart={onDragStart} />)

    fireEvent.dragStart(screen.getByAltText('横顔.png'))

    expect(onDragStart).toHaveBeenCalledWith(expect.anything(), '/uploads/materials/1/side.png')
  })
})
