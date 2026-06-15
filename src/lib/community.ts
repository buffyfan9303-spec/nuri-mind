import { supabase } from './supabase'
import type { Avatar, CommunityPost } from '../data/types'

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

interface Row {
  id: string
  device_id: string
  nick: string
  avatar: Avatar
  badge: string | null
  body: string
  likes: number
  created_at: string
}

function toPost(row: Row, deviceId: string, liked: Set<string>): CommunityPost {
  return {
    id: row.id,
    nick: row.nick,
    avatar: row.avatar ?? null,
    badge: row.badge ?? undefined,
    text: row.body,
    likes: row.likes ?? 0,
    liked: liked.has(row.id),
    mine: row.device_id === deviceId,
    at: new Date(row.created_at).getTime(),
  }
}

/** 서버에서 최신 글 불러오기 (실패 시 throw → 호출부가 로컬 폴백) */
export async function fetchPosts(deviceId: string): Promise<CommunityPost[]> {
  if (!supabase) throw new Error('supabase-not-configured')
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  const liked = likedSet()
  return (data as Row[]).map((r) => toPost(r, deviceId, liked))
}

export async function createPost(
  deviceId: string,
  p: { nick: string; avatar: Avatar; badge?: string; text: string },
): Promise<void> {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase.from('posts').insert({
    device_id: deviceId,
    nick: p.nick,
    avatar: p.avatar,
    badge: p.badge ?? null,
    body: p.text.trim().slice(0, 280),
  })
  if (error) throw error
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

export async function removePost(postId: string, deviceId: string): Promise<void> {
  if (!supabase) throw new Error('supabase-not-configured')
  const { error } = await supabase.rpc('delete_my_post', { pid: postId, did: deviceId })
  if (error) throw error
}
