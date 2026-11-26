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
  setMenu,
  setMenuError,
  setMenuLoading,
} from '../redux/menuSlice'
import useAuth from './useAuth'
import useDebounce from './useDebounce'

let syncedUserId = null

export function resetSyncedMenuUser() {
  syncedUserId = null
}

export default function useMenuSync() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const userId = user?.id ?? null

  const days = useSelector(selectMenuDays)
  const status = useSelector(selectMenuStatus)
  const dirty = useSelector(selectMenuDirty)
  const debouncedDays = useDebounce(days, 800)

  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!userId) {
      syncedUserId = null
      dispatch(resetMenu())
      return
    }

    if (syncedUserId === userId) return

    let cancelled = false
    if (syncedUserId !== null) {
      dispatch(resetMenu())
    }
    dispatch(setMenuLoading())

    getMenu(userId)
      .then((menu) => {
        if (cancelled) return
        syncedUserId = userId
        dispatch(setMenu({ days: menu?.days ?? createEmptyDays() }))
      })
      .catch(() => {
        if (cancelled) return
        dispatch(setMenuError())
      })

    return () => {
      cancelled = true
    }
  }, [userId, dispatch])

  useEffect(() => {
    if (!userId || status !== 'ready' || !dirty) return
    if (debouncedDays !== days) return

    let cancelled = false

    saveMenu(userId, debouncedDays)
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
  }, [userId, status, dirty, debouncedDays, days, dispatch])

  const retrySave = useCallback(() => {
    if (!userId || status !== 'ready' || !dirty) return
    saveMenu(userId, days)
      .then(() => {
        setSaveError(null)
        dispatch(markSaved())
      })
      .catch(() => {
        setSaveError('Chưa lưu được thực đơn')
      })
  }, [userId, status, dirty, days, dispatch])

  return { saveError, retrySave }
}
