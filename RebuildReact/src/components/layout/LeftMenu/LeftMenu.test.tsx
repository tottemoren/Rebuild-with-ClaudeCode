import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import LeftMenu from './LeftMenu'

function CurrentPath() {
  return <p data-testid="current-path">{useLocation().pathname}</p>
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <LeftMenu />
      <Routes>
        <Route path="*" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LeftMenu', () => {
  test('4つのメニューが日本語で表示される', () => {
    renderAt('/home')

    expect(screen.getByRole('button', { name: 'ホーム' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'メモ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ストーリー創作' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '漫画創作' })).toBeInTheDocument()
  })

  test('今いる画面のメニューだけが現在地になる', () => {
    renderAt('/MemoPage')

    expect(screen.getByRole('button', { name: 'メモ' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'ホーム' })).not.toHaveAttribute('aria-current')
  })

  test('漫画作成の編集画面では「漫画創作」が現在地になる', () => {
    renderAt('/CreateMangaPage')

    expect(screen.getByRole('button', { name: '漫画創作' })).toHaveAttribute('aria-current', 'page')
  })

  test('メニューを押すとその画面へ移動する', async () => {
    renderAt('/home')

    await userEvent.click(screen.getByRole('button', { name: 'ストーリー創作' }))

    expect(screen.getByTestId('current-path')).toHaveTextContent('/StoryCreatePage')
  })
})
