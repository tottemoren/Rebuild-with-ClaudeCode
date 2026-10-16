import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

function renderPage() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )
}

async function fillAndSubmit() {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('ユーザー名'), 'ミカ')
  await user.type(screen.getByPlaceholderText('メールアドレス'), 'mika@example.com')
  await user.type(screen.getByPlaceholderText('パスワード'), 'secret')
  await user.type(screen.getByPlaceholderText('招待コード'), 'code')
  await user.click(screen.getByRole('button', { name: '登録' }))
}

describe('RegisterPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('メールアドレスの入力欄がある', () => {
    renderPage()

    expect(screen.getByPlaceholderText('メールアドレス')).toHaveAttribute('type', 'email')
  })

  test('登録するとき、メールアドレスもサーバーに送る', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('登録成功', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderPage()

    await fillAndSubmit()

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({
      username: 'ミカ',
      email: 'mika@example.com',
      password: 'secret',
      inviteCode: 'code',
    })
  })

  test('重複などで登録できなかったときは、サーバーからの理由を表示する', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('このユーザー名は既に使われています', { status: 409 })
    ))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('このユーザー名は既に使われています')
  })

  test('サーバーに接続できないときは、その旨を表示する', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('サーバーに接続できませんでした')
  })
})
