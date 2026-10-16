import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from './api'

function lastRequest(fetchMock: ReturnType<typeof vi.fn>) {
  const [url, init] = fetchMock.mock.calls[0]
  return { url: url as string, headers: new Headers((init as RequestInit).headers) }
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('ok')))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  test('合言葉があれば、Authorization ヘッダーに付けて送る', async () => {
    setAuthToken('abc.def.ghi')

    await apiFetch('/api/memos')

    const { url, headers } = lastRequest(fetch as ReturnType<typeof vi.fn>)
    expect(url).toBe(`${import.meta.env.VITE_API_BASE_URL}/api/memos`)
    expect(headers.get('Authorization')).toBe('Bearer abc.def.ghi')
  })

  test('合言葉がなければ、Authorization ヘッダーは付けない', async () => {
    await apiFetch('/api/memos')

    const { headers } = lastRequest(fetch as ReturnType<typeof vi.fn>)
    expect(headers.has('Authorization')).toBe(false)
  })

  test('呼び出し側が指定したヘッダーと送信内容は、そのまま送る', async () => {
    setAuthToken('abc.def.ghi')

    await apiFetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"x"}',
    })

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const headers = new Headers((init as RequestInit).headers)
    expect((init as RequestInit).method).toBe('POST')
    expect((init as RequestInit).body).toBe('{"title":"x"}')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBe('Bearer abc.def.ghi')
  })

  test('合言葉を消すと、以後は付けない', async () => {
    setAuthToken('abc.def.ghi')
    clearAuthToken()

    await apiFetch('/api/memos')

    expect(getAuthToken()).toBeNull()
    const { headers } = lastRequest(fetch as ReturnType<typeof vi.fn>)
    expect(headers.has('Authorization')).toBe(false)
  })
})
