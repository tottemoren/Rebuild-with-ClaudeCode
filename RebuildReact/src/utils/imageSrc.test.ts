import { resolveImageSrc } from './imageSrc'

describe('resolveImageSrc', () => {
  test('アップロードした素材（/uploads/...）には、バックエンドの住所を補う', () => {
    expect(resolveImageSrc('/uploads/materials/6/a.png')).toBe(
      `${import.meta.env.VITE_API_BASE_URL}/uploads/materials/6/a.png`
    )
  })

  test('フロントエンドの画像（/images/...）は、そのまま返す', () => {
    expect(resolveImageSrc('/images/settingimages/blankpaper.png')).toBe(
      '/images/settingimages/blankpaper.png'
    )
  })
})
