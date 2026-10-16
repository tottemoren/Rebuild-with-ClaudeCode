import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

async function login() {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('ユーザー名'), 'ミカ')
  await user.type(screen.getByPlaceholderText('パスワード'), 'secret')
  await user.click(screen.getByRole('button', { name: 'ログイン' }))
}

function respondWith(body: object) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status: 200 })
  ))
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  test('ログインに成功すると、合言葉とユーザー情報を分けて保存する', async () => {
    respondWith({ id: 1, username: 'ミカ', role: 'USER', token: 'abc.def.ghi' })
    renderPage()

    await login()

    expect(localStorage.getItem('authToken')).toBe('abc.def.ghi')
    expect(JSON.parse(localStorage.getItem('loginUser') ?? '{}')).toEqual({ id: 1, username: 'ミカ', role: 'USER' })
  })

  test('合言葉を返さない古いバックエンドでも、ログインでき、古い合言葉は残さない', async () => {
    localStorage.setItem('authToken', 'old.token.value')
    respondWith({ id: 1, username: 'ミカ', role: 'USER' })
    renderPage()

    await login()

    expect(localStorage.getItem('authToken')).toBeNull()
    expect(JSON.parse(localStorage.getItem('loginUser') ?? '{}')).toEqual({ id: 1, username: 'ミカ', role: 'USER' })
  })
})
