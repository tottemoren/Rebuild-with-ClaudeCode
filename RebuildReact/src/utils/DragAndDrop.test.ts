import { loadImage } from './DragAndDrop'

// jsdom は実際には画像を読み込まないため、読み込み方の設定だけを記録する偽の Image に差し替える
class FakeImage {
  static last: FakeImage | null = null
  crossOrigin: string | null = null
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  private _src = ''
  srcSetAfterCrossOrigin = false

  constructor() {
    FakeImage.last = this
  }

  set src(value: string) {
    this.srcSetAfterCrossOrigin = this.crossOrigin === 'anonymous'
    this._src = value
  }

  get src() {
    return this._src
  }
}

describe('loadImage', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('許可（CORS）付きで画像を読み込む', async () => {
    const promise = loadImage('http://localhost:8080/uploads/materials/1/a.png')
    const image = FakeImage.last!
    image.onload?.()
    await promise

    expect(image.crossOrigin).toBe('anonymous')
    // 読み込み開始（src の設定）より前に許可の設定をしないと、効果がない
    expect(image.srcSetAfterCrossOrigin).toBe(true)
  })

  test('読み込みに失敗したら、分かるメッセージでエラーにする', async () => {
    const promise = loadImage('/missing.png')
    FakeImage.last!.onerror?.()

    await expect(promise).rejects.toThrow('画像の読み込みに失敗しました: /missing.png')
  })
})
