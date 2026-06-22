/**
 * UI 배럴(barrel) — 기존 `import { Card, Modal, ... } from '../components/ui'` 경로를 그대로 유지하면서
 * 실제 구현은 아토믹 폴더(primitives/ · surfaces/)로 분리. 소비자(33개 페이지)는 한 줄도 안 바뀐다.
 */
export { DiamondPill, PointsPill } from './primitives/Pill'
export { Chip } from './primitives/Chip'
export { ProgressBar } from './primitives/ProgressBar'
export { Card } from './surfaces/Card'
export { Modal } from './surfaces/Modal'
export { Section } from './surfaces/Section'
export { TopBar } from './surfaces/TopBar'
