import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

function renderWithUser(user: object) {
  localStorage.setItem('loginUser', JSON.stringify(user))
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  afterEach(() => {
    localStorage.clear()
  })

  test('プロフィール画像がないときは、ユーザー名の1文字目を表示する', () => {
    renderWithUser({ id: 1, username: 'あかり' })

    const profileButton = screen.getByTitle('プロフィール画像を変更')
    expect(profileButton).toHaveTextContent('あ')
    expect(screen.queryByAltText('プロフィール画像')).not.toBeInTheDocument()
  })

  test('プロフィール画像があるときは、画像を表示する', () => {
    renderWithUser({ id: 1, username: 'あかり', profileImageUrl: '/uploads/profile.png' })

    expect(screen.getByAltText('プロフィール画像')).toBeInTheDocument()
  })

  test('ロゴと検索ボタンに、読み上げ用の名前が付いている', () => {
    renderWithUser({ id: 1, username: 'あかり' })

    expect(screen.getByRole('button', { name: 'Rebuild（再読み込み）' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument()
  })
})
