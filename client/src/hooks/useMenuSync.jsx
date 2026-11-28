import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMenu, saveMenu } from '../api'
import {
  createEmptyDays,
  markSaved,
  resetMenu,
  selectMenuDays,
  selectMenuDirty,
  selectMenuStatus,
  selectMenuWeekKey,
  setMenu,
  setMenuError,
  setMenuLoading,
} from '../redux/menuSlice'
import useAuth from './useAuth'
import useDebounce from './useDebounce'

let syncedUserId = null
let syncedWeekKey = null

export function resetSyncedMenuUser() {
  syncedUserId = null
  syncedWeekKey = null
}

export default function useMenuSync() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const userId = user?.id ?? null

  const days = useSelector(selectMenuDays)
  const weekKey = useSelector(selectMenuWeekKey)
  const status = useSelector(selectMenuStatus)
  const dirty = useSelector(selectMenuDirty)
  const debouncedDays = useDebounce(days, 800)

  const [saveError, setSaveError] = useState(null)

  // Load menu when userId or weekKey changes
  useEffect(() => {
    if (!userId) {
      syncedUserId = null
      syncedWeekKey = null
      dispatch(resetMenu())
      return
    }

    if (syncedUserId === userId && syncedWeekKey === weekKey) return

    let cancelled = false
    const isSameUser = syncedUserId === userId
    if (!isSameUser) {
      dispatch(resetMenu())
      syncedWeekKey = null
    }
    dispatch(setMenuLoading())

    getMenu(userId, weekKey)
      .then((menu) => {
        if (cancelled) return
        syncedUserId = userId
        syncedWeekKey = weekKey
        const daysData = menu?.days ?? createEmptyDays()
        dispatch(setMenu({ days: daysData, weekKey: menu?.weekKey ?? weekKey }))
      })
      .catch(() => {
        if (cancelled) return
        dispatch(setMenuError())
      })

    return () => {
      cancelled = true
    }
  }, [userId, weekKey, dispatch])

  // Save menu when dirty for current week
  useEffect(() => {
    if (!userId || status !== 'ready' || !dirty || !weekKey) return
    if (debouncedDays !== days) return

    let cancelled = false

    saveMenu(userId, weekKey, debouncedDays)
      .then(() => {
        if (cancelled) return
        setSaveError(null)
        dispatch(markSaved())
      })
      .catch(() => {
        if (cancelled) return
        setSaveError('Chưa lưu được thực đơn')
      })

    return () => {
      cancelled = true
    }
  }, [userId, status, dirty, debouncedDays, days, weekKey, dispatch])

  const retrySave = useCallback(() => {
    if (!userId || status !== 'ready' || !dirty || !weekKey) return
    saveMenu(userId, weekKey, days)
      .then(() => {
        setSaveError(null)
        dispatch(markSaved())
      })
      .catch(() => {
        setSaveError('Chưa lưu được thực đơn')
      })
  }, [userId, status, dirty, days, weekKey, dispatch])

  return { saveError, retrySave }
}
