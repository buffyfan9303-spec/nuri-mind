import { supabase } from './supabase'
import type { Avatar, CommunityComment, CommunityPost } from '../data/types'

/**
 * 커뮤니티 데이터 계층 — Supabase 연동(스키마 적용 시) / 미적용 시 호출부가 localStorage 폴백.
 * 좋아요 상태(liked)는 기기 로컬에 저장(서버는 likes 카운트만 관리).
 */
const LIKED_KEY = 'nuri-liked-posts'

function likedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function saveLiked(s: Set<string>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...s]))
  } catch {
    /* noop */
  }
}

// ── 소유권(글·댓글 삭제 권한) ─────────────────────────────────────
/**
 * 예전엔 device_id 원문을 서버에 저장하고 누구나 select로 읽을 수 있었다 → 남의 device_id로 delete_my_post를 불러
 * 아무 글이나 지울 수 있었다. 이제는:
 *  · 기기(=계정별 deviceId)마다 32바이트 난수 비밀 토큰을 로컬에만 둔다
 *  · insert 때 sha256(토큰)을 owner_hash로 보낸다(서버 트리거가 device_id 칸도 해시로 덮는다)
 *  · 삭제는 원문 토큰을 보내고 서버가 sha256(토큰) = owner_hash를 확인한다
 *  · 이전 글(owner_hash = sha256(옛 device_id))은 deviceId를 비밀로 보낸다
 * 서버 SQL(supabase/community-owner-fix-2026-09.sql)이 아직 없으면 owner_hash 컬럼 오류를 감지해 옛 경로로 폴백한다.
 */
const OWNER_KEY = (deviceId: string) => `nuri-community-owner:${deviceId}`

/** deviceId마다 비밀 토큰 하나 — 계정 전환 시 deviceId가 바뀌므로 소유권도 계정별로 갈린다 */
function ownerToken(deviceId: string): string | null {
  try {
    const k = OWNER_KEY(deviceId)
    const cur = localStorage.getItem(k)
    if (cur && /^[0-9a-f]{64}$/.test(cur)) return cur
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') return null
    const b = crypto.getRandomValues(new Uint8Array(32))
    const tok = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(k, tok)
    // 저장이 안 되는 환경(사생활 모드 등)이면 다음에 다른 토큰이 나와 지울 수 없게 되므로 쓰지 않는다
    return localStorage.getItem(k) === tok ? tok : null
  } catch {
    return null
  }
}

async function sha256Hex(text: string): Promise<string | null> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf), (x) => x.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

interface Owner {
  token: string | null
  tokenHash: string | null
  /** 이전 글용: sha256(deviceId) */
  legacyHash: string | null
}
const ownerCache = new Map<string, Promise<Owner>>()
function owner(deviceId: string): Promise<Owner> {
  let p = ownerCache.get(deviceId)
  if (!p) {
    p = (async () => {
      const token = ownerToken(deviceId)
      const [tokenHash, legacyHash] = await Promise.all([
        token ? sha256Hex(token) : Promise.resolve(null),
        sha256Hex(deviceId),
      ])
      return { token, tokenHash, legacyHash }
    })()
    ownerCache.set(deviceId, p)
  }
  return p
}

/** 서버가 owner_hash를 아는지 — null=미확인, false=SQL 미적용(옛 경로) */
let ownerHashSupported: boolean | null = null
/** 이 글/댓글의 삭제 비밀 — 행 id → 비밀. '내 것'으로 판정된 것만 담긴다(원문은 메모리에만) */
const secretById = new Map<string, string>()

function isMissingOwnerColumn(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null
  if (!e) return false
  // 42703 = undefined_column(Postgres), PGRST204 = PostgREST 스키마 캐시에 컬럼 없음
  // 코드로만 판정 — 메시지에 owner_hash가 든 다른 오류(트리거의 'invalid owner_hash' 22023)까지 폴백으로 오판하지 않게
  return e.code === '42703' || e.code === 'PGRST204'
}

/** 행의 소유 판정 + 삭제 비밀 기억 */
function resolveMine(
  id: string,
  row: { owner_hash?: string | null; device_id?: string | null },
  deviceId: string,
  o: Owner,
): boolean {
  if (row.owner_hash != null) {
    if (o.token && o.tokenHash && row.owner_hash === o.tokenHash) {
      secretById.set(id, o.token)
      return true
    }
    if (o.legacyHash && row.owner_hash === o.legacyHash) {
      secretById.set(id, deviceId)
      return true
    }
    return false
  }
  // 옛 서버(SQL 미적용): device_id 원문 비교
  if (row.device_id != null && row.device_id === deviceId) {
    secretById.set(id, deviceId)
    return true
  }
  return false
}

// select 컬럼 — device_id는 읽지 않는다(서버 SQL 적용 후엔 해시일 뿐이지만 필요 없다)
const POST_COLS = 'id,nick,avatar,badge,body,likes,created_at,owner_hash'
const POST_COLS_LEGACY = 'id,device_id,nick,avatar,badge,body,likes,created_at'
const COMMENT_COLS = 'id,post_id,nick,avatar,badge,body,created_at,owner_hash'
const COMMENT_COLS_LEGACY = 'id,post_id,device_id,nick,avatar,badge,body,created_at'

/** owner_hash 컬럼을 쓰는 select → 컬럼이 없으면 옛 컬럼으로 한 번 더 */
async function selectWithFallback<T>(
  run: (cols: string) => PromiseLike<{ data: unknown; error: unknown }>,
  cols: string,
  legacyCols: string,
): Promise<T[]> {
  if (ownerHashSupported !== false) {
    const { data, error } = await run(cols)
    if (!error) {
      ownerHashSupported = true
      return (data ?? []) as T[]
    }
    if (!isMissingOwnerColumn(error)) throw error
    ownerHashSupported = false
  }
  const { data, error } = await run(legacyCols)
  if (error) throw error
  return (data ?? []) as T[]
}

/** owner_hash를 실어 insert → 컬럼이 없으면 옛 방식(device_id 원문)으로 */
async function insertWithOwner(table: 'posts' | 'comments', deviceId: string, row: Record<string, unknown>) {
  if (!supabase) throw new Error('supabase-not-configured')
  const o = await owner(deviceId)
  if (ownerHashSupported !== false && o.token && o.tokenHash) {
    // device_id는 NOT NULL 칸을 채우는 자리표시 — 서버 트리거가 owner_hash로 덮는다(원문 deviceId를 보내지 않는다)
    const { error } = await supabase.from(table).insert({ ...row, device_id: o.tokenHash, owner_hash: o.tokenHash })
    if (!error) return
    if (!isMissingOwnerColumn(error)) throw error
    ownerHashSupported = false
  }
  const { error } = await supabase.from(table).insert({ ...row, device_id: deviceId })
  if (error) throw error
}

interface Row {
  id: string
  device_id?: string | null
  owner_hash?: string | null
  nick: string
  avatar: Avatar
  badge: string | null
  body: string
  likes: number
  created_at: string
}

function toPost(row: Row, deviceId: string, liked: Set<string>, o: Owner): CommunityPost {
  return {
    id: row.id,
    nick: row.nick,
    avatar: row.avatar ?? null,
    badge: row.badge ?? undefined,
    text: row.body,
    likes: row.likes ?? 0,
    liked: liked.has(row.id),
    mine: resolveMine(row.id, row, deviceId, o),
    at: new Date(row.created_at).getTime(),
  }
}

/** 서버에서 최신 글 불러오기 (실패 시 throw → 호출부가 로컬 폴백) */
export async function fetchPosts(deviceId: string): Promise<CommunityPost[]> {
  const sb = supabase
  if (!sb) throw new Error('supabase-not-configured')
  const [rows, o] = await Promise.all([
    selectWithFallback<Row>(
      (cols) => sb.from('posts').select(cols).order('created_at', { ascending: false }).limit(100),
      POST_COLS,
      POST_COLS_LEGACY,
    ),
    owner(deviceId),
  ])
  const liked = likedSet()
  return rows.map((r) => toPost(r, deviceId, liked, o))
}

export async function createPost(
  deviceId: string,
  p: { nick: string; avatar: Avatar; badge?: string; text: string },
): Promise<void> {
  await insertWithOwner('posts', deviceId, {
    nick: p.nick,
    avatar: p.avatar,
    badge: p.badge ?? null,
    body: p.text.trim().slice(0, 280),
  })
}

/** 좋아요 토글 → 새 liked 상태 반환 (서버 카운트 RPC 증감) */
export async function toggleLike(postId: string): Promise<boolean> {
  if (!supabase) throw new Error('supabase-not-configured')
  const liked = likedSet()
  const willLike = !liked.has(postId)
  const { error } = await supabase.rpc('bump_like', { pid: postId, delta: willLike ? 1 : -1 })
  if (error) throw error
  if (willLike) liked.add(postId)
  else liked.delete(postId)
  saveLiked(liked)
  return willLike
}

/** 내 글 삭제 — 목록에서 '내 것'으로 판정될 때 기억한 비밀(토큰 또는 이전 글이면 deviceId)을 보낸다 */
export async function removePost(postId: string, deviceId: string): Promise<void> {
  if (!supabase) throw new Error('supabase-not-configured')
  const did = secretById.get(postId) ?? deviceId
  const { error } = await supabase.rpc('delete_my_post', { pid: postId, did })
  if (error) throw error
  secretById.delete(postId)
}

// ── 댓글 ──────────────────────────────────────────────────────────
interface CommentRow {
  id: string
  post_id: string
  device_id?: string | null
  owner_hash?: string | null
  nick: string
  avatar: Avatar
  badge: string | null
  body: string
  created_at: string
}

function toComment(row: CommentRow, deviceId: string, o: Owner): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    nick: row.nick,
    avatar: row.avatar ?? null,
    badge: row.badge ?? undefined,
    text: row.body,
    at: new Date(row.created_at).getTime(),
    mine: resolveMine(row.id, row, deviceId, o),
  }
}

/** 글의 댓글 목록 (오래된 순) */
export async function fetchComments(postId: string, deviceId: string): Promise<CommunityComment[]> {
  const sb = supabase
  if (!sb) throw new Error('supabase-not-configured')
  const [rows, o] = await Promise.all([
    selectWithFallback<CommentRow>(
      (cols) =>
        sb.from('comments').select(cols).eq('post_id', postId).order('created_at', { ascending: true }).limit(200),
      COMMENT_COLS,
      COMMENT_COLS_LEGACY,
    ),
    owner(deviceId),
  ])
  return rows.map((r) => toComment(r, deviceId, o))
}

export async function createComment(
  deviceId: string,
  postId: string,
  c: { nick: string; avatar: Avatar; badge?: string; text: string },
): Promise<void> {
  await insertWithOwner('comments', deviceId, {
    post_id: postId,
    nick: c.nick,
    avatar: c.avatar,
    badge: c.badge ?? null,
    body: c.text.trim().slice(0, 200),
  })
}

// ── 신고 (운영자 모더레이션 — anon은 insert만, 검토는 Supabase 대시보드) ──
export async function reportPostServer(
  deviceId: string,
  postId: string,
  r: { nick: string; excerpt: string; reason: string },
): Promise<void> {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase.from('reports').insert({
    post_id: postId,
    device_id: deviceId,
    nick: r.nick,
    excerpt: r.excerpt.slice(0, 60),
    reason: r.reason,
  })
  if (error) throw error
}
