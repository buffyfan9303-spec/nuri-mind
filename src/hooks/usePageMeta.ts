import { useEffect } from 'react'

const SITE = 'https://www.nurimind.co.kr'

/**
 * 공개 콘텐츠 페이지의 SEO 메타 — 화면마다 고유한 <title>·description·canonical.
 *
 * SPA라 index.html의 메타 한 벌을 모든 주소가 같이 쓴다. 그대로 두면 검색엔진·광고 심사가 매거진 글 10편을
 * '제목·설명이 똑같은 페이지 10장'(중복·얇은 콘텐츠)으로 본다. 마운트 시 바꾸고 언마운트 시 원래 값으로 되돌린다
 * (되돌리지 않으면 다음 화면이 이 글의 canonical을 자기 것으로 주장한다 — ZodiacLanding과 같은 규칙).
 * meta가 null이면(데이터 없음·리다이렉트 직전) 아무것도 하지 않는다.
 */
export function usePageMeta(meta: { title: string; description: string; path: string } | null) {
  const title = meta?.title
  const description = meta?.description
  const path = meta?.path
  useEffect(() => {
    if (!title || description === undefined || path === undefined) return
    const prevTitle = document.title
    const md = document.querySelector('meta[name="description"]')
    const prevDesc = md?.getAttribute('content') ?? ''
    const cl = document.querySelector('link[rel="canonical"]')
    const prevCanon = cl?.getAttribute('href') ?? ''
    document.title = title
    md?.setAttribute('content', description)
    cl?.setAttribute('href', `${SITE}${path}`)
    return () => {
      document.title = prevTitle
      md?.setAttribute('content', prevDesc)
      if (prevCanon) cl?.setAttribute('href', prevCanon)
    }
  }, [title, description, path])
}
