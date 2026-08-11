// ヘッダーの検索バーで使う、ページを問わない汎用の「完全一致ハイライト」機能。
//
// Headerコンポーネントは main-contents（各ページの中央コンテンツ）の中身を
// 知らないので、Reactの外側でDOMを直接見て、テキストが検索語と完全一致する
// 要素（子要素を持たない、テキストだけの要素）に search-highlight クラスを付ける。
//
// 対象ページ側の再レンダリングが起きるとReactがclassNameを元に戻すため
// ハイライトは消える場合がある（ブラウザの「ページ内検索」に近い、一時的なもの）。

const HIGHLIGHT_CLASS = "search-highlight";
const MAIN_CONTENTS_SELECTOR = ".main-contents";

export function clearSearchHighlights(): void {
  document
    .querySelectorAll(`.${HIGHLIGHT_CLASS}`)
    .forEach((el) => el.classList.remove(HIGHLIGHT_CLASS));
}

function isTextOnlyElement(el: Element): boolean {
  // 子要素（タグ）を持たない = テキストのみの末端要素
  return el.children.length === 0;
}

/**
 * main-contents の中から、テキストが query と完全一致する要素を探してハイライトする。
 * 戻り値は見つかった件数。
 */
export function highlightExactMatches(query: string): number {
  clearSearchHighlights();

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return 0;
  }

  const container = document.querySelector(MAIN_CONTENTS_SELECTOR);

  if (!container) {
    return 0;
  }

  const elements = container.querySelectorAll("*");
  let matchCount = 0;

  elements.forEach((el) => {
    if (!isTextOnlyElement(el)) {
      return;
    }

    const text = (el.textContent ?? "").trim();

    if (text !== "" && text === trimmedQuery) {
      el.classList.add(HIGHLIGHT_CLASS);
      matchCount++;
    }
  });

  return matchCount;
}
