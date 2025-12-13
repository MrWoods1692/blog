import { useEffect, useRef, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'

const API_URL = 'https://api.milorapart.top/apis/random'
const AUTO_PLAY_DELAY = 2000
const NEXT_DELAY = 1000

const formatTime = (sec: number) => {
	if (!isFinite(sec)) return '00:00'
	const m = Math.floor(sec / 60)
	const s = Math.floor(sec % 60)
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset

	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y -
			  clockCardStyles.offset +
			  CARD_SPACING +
			  calendarCardStyles.height +
			  CARD_SPACING

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const barRef = useRef<HTMLDivElement | null>(null)

	const draggingRef = useRef(false)
	const wasPlayingRef = useRef(false)
	const dragRatioRef = useRef(0)

	const sessionRef = useRef(0) // 关键：防止死循环

	const [songTitle, setSongTitle] = useState('随机音乐')
	const [displayTitle, setDisplayTitle] = useState('音乐')
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	/** 安全加载并播放 */
	const loadAndPlay = async () => {
		if (isLoading) return

		const sessionId = ++sessionRef.current
		setIsLoading(true)
		setIsPlaying(false)
		setDisplayTitle('音乐')

		try {
			const res = await fetch(API_URL)
			const json = await res.json()
			if (sessionId !== sessionRef.current) return

			const { audiosrc, nickname } = json?.data || {}
			if (!audiosrc || !audioRef.current) return

			const audio = audioRef.current
			audio.src = audiosrc
			audio.load()

			setSongTitle(nickname || '随机音乐')
			setCurrentTime(0)

			await audio.play()
			if (sessionId !== sessionRef.current) return

			setIsPlaying(true)
			setDisplayTitle(nickname || '随机音乐')
		} catch {
			// 静默失败，不重试，避免死循环
		} finally {
			if (sessionId === sessionRef.current) {
				setIsLoading(false)
			}
		}
	}

	const togglePlay = async () => {
		if (!audioRef.current || isLoading) return
		const audio = audioRef.current

		if (isPlaying) {
			audio.pause()
			setIsPlaying(false)
			setDisplayTitle('音乐')
		} else {
			await audio.play()
			setIsPlaying(true)
			setDisplayTitle(songTitle)
		}
	}

	const updateDragRatio = (clientX: number) => {
		if (!barRef.current) return
		const rect = barRef.current.getBoundingClientRect()
		dragRatioRef.current = Math.min(
			Math.max((clientX - rect.left) / rect.width, 0),
			1
		)
	}

	useEffect(() => {
		const audio = new Audio()
		audioRef.current = audio

		audio.addEventListener('loadedmetadata', () => {
			setDuration(audio.duration || 0)
		})

		audio.addEventListener('timeupdate', () => {
			if (!draggingRef.current) {
				setCurrentTime(audio.currentTime)
			}
		})

		audio.addEventListener('ended', () => {
			if (draggingRef.current) return
			setIsPlaying(false)
			setDisplayTitle('音乐')
			setTimeout(loadAndPlay, NEXT_DELAY)
		})

		const timer = setTimeout(loadAndPlay, AUTO_PLAY_DELAY)

		const onMouseUp = () => {
			if (!draggingRef.current || !audioRef.current) return
			draggingRef.current = false

			const seekTime = dragRatioRef.current * duration
			audioRef.current.currentTime = seekTime
			setCurrentTime(seekTime)

			if (wasPlayingRef.current) {
				audioRef.current.play()
				setIsPlaying(true)
				setDisplayTitle(songTitle)
			}
		}

		window.addEventListener('mouseup', onMouseUp)

		return () => {
			clearTimeout(timer)
			window.removeEventListener('mouseup', onMouseUp)
			audio.pause()
		}
	}, [duration, songTitle])

	const visualRatio = draggingRef.current
		? dragRatioRef.current
		: duration
		? currentTime / duration
		: 0

	const timeText = draggingRef.current
		? formatTime(dragRatioRef.current * duration)
		: formatTime(currentTime)

	return (
		<HomeDraggableLayer cardKey="musicCard" x={x} y={y} width={styles.width} height={styles.height}>
			<Card className="flex items-center gap-3">
				<MusicSVG className="h-8 w-8" />

				<div className="flex-1">
					<div className="flex justify-between text-sm text-secondary">
						<span className="truncate">
							{isLoading ? '加载中…' : displayTitle}
						</span>
						<span>{timeText}</span>
					</div>

					<div
						ref={barRef}
						className="mt-1 h-2 rounded-full bg-white/60 cursor-pointer overflow-hidden"
						onMouseDown={e => {
							if (!audioRef.current || !duration) return
							draggingRef.current = true
							wasPlayingRef.current = isPlaying
							audioRef.current.pause()
							setIsPlaying(false)
							updateDragRatio(e.clientX)
						}}
						onMouseMove={e => {
							if (draggingRef.current) {
								updateDragRatio(e.clientX)
							}
						}}
					>
						<div
							className="bg-linear h-full rounded-full"
							style={{ width: `${visualRatio * 100}%` }}
						/>
					</div>
				</div>

				<button
					onClick={togglePlay}
					disabled={isLoading}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white disabled:opacity-50"
				>
					{isPlaying ? (
						<div className="flex gap-1">
							<span className="h-4 w-1 bg-brand rounded" />
							<span className="h-4 w-1 bg-brand rounded" />
						</div>
					) : (
						<PlaySVG className="ml-1 h-4 w-4 text-brand" />
					)}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
