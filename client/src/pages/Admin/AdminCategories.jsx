import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getRecipes,
  updateCategory,
} from '../../api';
import './AdminCategories.css';

const MAX_NAME_LENGTH = 40;
const TOAST_DURATION_MS = 3500;

function EmptyCategoryIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 10.5C3.1 10.2 2.2 9 2.5 7.5C2.8 5.9 4.2 5 6 5H12C13.8 5 15.2 5.9 15.5 7.5C15.8 9 14.9 10.2 13.5 10.5V18C13.5 18.83 12.83 19.5 12 19.5H6C5.17 19.5 4.5 18.83 4.5 18V10.5Z" />
      <path d="M12 5H18C19.8 5 21.2 5.9 21.5 7.5C21.8 9 20.9 10.2 19.5 10.5V18C19.5 18.83 18.83 19.5 18 19.5H12" />
    </svg>
  );
}

function normalizeCategoryList(raw, countsByCategory = {}) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.categories)
      ? raw.categories
      : [];

  return list
    .map((item, index) => {
      if (typeof item === 'string') {
        const name = item.trim();
        if (!name) return null;
        return {
          id: null,
          key: `legacy-${name}-${index}`,
          name,
          recipeCount: countsByCategory[name.toLowerCase()] ?? 0,
        };
      }

      const id = item?.id ?? item?._id ?? null;
      const name = String(item?.name || '').trim();
      if (!name) return null;

      const recipeCount =
        typeof item?.recipeCount === 'number'
          ? item.recipeCount
          : countsByCategory[name.toLowerCase()] ?? 0;

      return {
        id,
        key: id !== null ? String(id) : `cat-${name}-${index}`,
        name,
        recipeCount,
      };
    })
    .filter(Boolean);
}

function validateName(rawValue, list, excludeKey = null) {
  const trimmed = String(rawValue || '').trim();
  if (!trimmed) return 'Vui lòng nhập tên loại món.';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Tên loại món tối đa ${MAX_NAME_LENGTH} ký tự.`;
  }

  const normalized = trimmed.toLowerCase();
  const isDuplicate = list.some(
    (item) => item.key !== excludeKey && item.name.toLowerCase() === normalized
  );
  if (isDuplicate) return 'Tên loại món này đã tồn tại.';
  return '';
}

function formatApiError(err, action) {
  const message = String(err?.message || '').trim();

  if (action === 'delete') {
    if (
      err?.status === 409 ||
      /\b409\b|đang.*dùng|đang có món|sử dụng/i.test(message)
    ) {
      return 'Loại món này đang có món sử dụng';
    }
  }

  if (action === 'create' || action === 'update') {
    if (err?.status === 409 || /\b409\b|trùng|tồn tại/i.test(message)) {
      return message && !/^Lỗi 409$/i.test(message)
        ? message
        : 'Tên loại món này đã tồn tại.';
    }
  }

  return message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingError, setEditingError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);
  const lastTriggerRef = useRef(null);
  const addInputRef = useRef(null);
  const editInputRef = useRef(null);
  const cancelDeleteBtnRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([
      getCategories(),
      getRecipes({ page: 1, limit: 100 }).catch(() => []),
    ])
      .then(([catData, recipeData]) => {
        if (!active) return;
        const recipes = Array.isArray(recipeData) ? recipeData : [];
        const countsByCategory = {};
        recipes.forEach((recipe) => {
          const catName = String(recipe?.category || '').trim().toLowerCase();
          if (catName) {
            countsByCategory[catName] = (countsByCategory[catName] || 0) + 1;
          }
        });
        setCategories(normalizeCategoryList(catData, countsByCategory));
        setStatus('done');
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err?.message || 'Không thể tải danh sách loại món.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isAddOpen) {
      addInputRef.current?.focus();
    }
  }, [isAddOpen]);

  useEffect(() => {
    if (editTarget) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editTarget]);

  useEffect(() => {
    if (deleteTarget) {
      cancelDeleteBtnRef.current?.focus();
    }
  }, [deleteTarget]);

  useEffect(() => {
    const hasOpenModal = isAddOpen || Boolean(editTarget) || Boolean(deleteTarget);
    if (!hasOpenModal) return;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (creating || savingEdit || deleting) return;

      event.preventDefault();
      setIsAddOpen(false);
      setCreateError('');
      setEditTarget(null);
      setEditingError('');
      setDeleteTarget(null);
      setDeleteError('');
      lastTriggerRef.current?.focus();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddOpen, editTarget, deleteTarget, creating, savingEdit, deleting]);

  const filteredCategories = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
  }, [categories, searchQuery]);

  const handleRetry = () => {
    setStatus('loading');
    setLoadError('');
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenAdd = (triggerEl) => {
    lastTriggerRef.current = triggerEl;
    setNewName('');
    setCreateError('');
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    if (creating) return;
    setIsAddOpen(false);
    setCreateError('');
    lastTriggerRef.current?.focus();
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateName(newName, categories);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    const trimmed = newName.trim();
    setCreating(true);
    setCreateError('');

    try {
      const created = await createCategory(trimmed);
      const createdItem =
        created && typeof created === 'object'
          ? {
              id: created.id ?? created._id ?? null,
              key: String(created.id ?? created._id ?? `new-${Date.now()}`),
              name: String(created.name || trimmed).trim(),
              recipeCount:
                typeof created.recipeCount === 'number' ? created.recipeCount : 0,
            }
          : null;

      if (createdItem && createdItem.id !== null) {
        setCategories((prev) => [...prev, createdItem]);
      } else {
        setReloadKey((prev) => prev + 1);
      }

      setNewName('');
      setIsAddOpen(false);
      showToast(`Đã thêm loại món “${trimmed}”.`);
      lastTriggerRef.current?.focus();
    } catch (err) {
      setCreateError(formatApiError(err, 'create'));
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (category, triggerEl) => {
    lastTriggerRef.current = triggerEl;
    setEditTarget(category);
    setEditingName(category.name);
    setEditingError('');
  };

  const handleCloseEdit = () => {
    if (savingEdit) return;
    setEditTarget(null);
    setEditingName('');
    setEditingError('');
    lastTriggerRef.current?.focus();
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;

    const trimmed = editingName.trim();
    if (trimmed === editTarget.name) {
      handleCloseEdit();
      return;
    }

    const validationError = validateName(trimmed, categories, editTarget.key);
    if (validationError) {
      setEditingError(validationError);
      return;
    }

    setSavingEdit(true);
    setEditingError('');

    try {
      let nextName = trimmed;
      if (editTarget.id !== null) {
        const updated = await updateCategory(editTarget.id, trimmed);
        nextName = String(updated?.name || trimmed).trim();
      }

      setCategories((prev) =>
        prev.map((item) =>
          item.key === editTarget.key ? { ...item, name: nextName } : item
        )
      );
      setEditTarget(null);
      setEditingName('');
      showToast(`Đã đổi tên thành “${nextName}”.`);
      lastTriggerRef.current?.focus();
    } catch (err) {
      setEditingError(formatApiError(err, 'update'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenDelete = (category, triggerEl) => {
    lastTriggerRef.current = triggerEl;
    setDeleteTarget(category);
    setDeleteError('');
  };

  const handleCloseDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError('');
    lastTriggerRef.current?.focus();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError('');

    try {
      if (deleteTarget.id !== null) {
        await deleteCategory(deleteTarget.id);
      } else if (deleteTarget.recipeCount > 0) {
        throw new Error('Loại món này đang có món sử dụng');
      }

      const removedName = deleteTarget.name;
      setCategories((prev) =>
        prev.filter((item) => item.key !== deleteTarget.key)
      );
      setDeleteTarget(null);
      showToast(`Đã xóa loại món “${removedName}”.`);
      lastTriggerRef.current?.focus();
    } catch (err) {
      setDeleteError(formatApiError(err, 'delete'));
    } finally {
      setDeleting(false);
    }
  };

  const addPreviewText = newName.trim() || 'Tên loại món';
  const editPreviewText = editingName.trim() || 'Tên loại món';

  return (
    <section className="admin-categories" aria-labelledby="admin-categories-title">
      <nav className="admin-categories__breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link to="/admin">Bảng điều khiển Admin</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Quản lý loại món</span>
      </nav>

      <header className="admin-categories__header">
        <h1 id="admin-categories-title">Quản lý loại món</h1>
        <p>Thêm và quản lý các loại món trên Cooked.</p>
      </header>

      <div className="admin-categories__toolbar">
        <span className="admin-categories__count" aria-live="polite">
          {categories.length} loại món
        </span>

        <input
          type="search"
          className="admin-categories__search"
          aria-label="Tìm loại món"
          placeholder="Tìm loại món..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />

        <button
          type="button"
          className="admin-categories__btn admin-categories__btn--primary admin-categories__add-trigger"
          onClick={(event) => handleOpenAdd(event.currentTarget)}
        >
          Thêm loại món
        </button>
      </div>

      {status === 'loading' && (
        <div className="admin-categories__state-card" role="status">
          <p>Đang tải danh sách loại món...</p>
        </div>
      )}

      {status === 'error' && (
        <div
          className="admin-categories__state-card admin-categories__state-card--error"
          role="alert"
        >
          <p>{loadError}</p>
          <button
            type="button"
            className="admin-categories__btn admin-categories__btn--outline"
            onClick={handleRetry}
          >
            Thử lại
          </button>
        </div>
      )}

      {status === 'done' && categories.length === 0 && (
        <div className="admin-categories__empty-card">
          <EmptyCategoryIcon />
          <p>Chưa có loại món nào.</p>
          <button
            type="button"
            className="admin-categories__btn admin-categories__btn--primary"
            onClick={(event) => handleOpenAdd(event.currentTarget)}
          >
            Thêm loại món
          </button>
        </div>
      )}

      {status === 'done' && categories.length > 0 && filteredCategories.length === 0 && (
        <div className="admin-categories__state-card">
          <p>Không tìm thấy loại món nào khớp với “{searchQuery.trim()}”.</p>
          <button
            type="button"
            className="admin-categories__btn admin-categories__btn--outline"
            onClick={() => setSearchQuery('')}
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {status === 'done' && filteredCategories.length > 0 && (
        <>
          <div className="admin-categories__table-card">
            <div className="admin-categories__table-head" aria-hidden="true">
              <span>Loại món</span>
              <span>Số công thức</span>
              <span>Thao tác</span>
            </div>

            <ul className="admin-categories__list">
              {filteredCategories.map((category) => (
                <li key={category.key} className="admin-categories__row">
                  <div className="admin-categories__col-name">
                    <span className="admin-categories__pill">Loại món</span>
                    <span className="admin-categories__name">{category.name}</span>
                  </div>

                  <div className="admin-categories__col-count">
                    {category.recipeCount} công thức
                  </div>

                  <div className="admin-categories__col-actions">
                    <button
                      type="button"
                      className="admin-categories__text-action"
                      onClick={(event) =>
                        handleOpenEdit(category, event.currentTarget)
                      }
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      className="admin-categories__text-action"
                      onClick={(event) =>
                        handleOpenDelete(category, event.currentTarget)
                      }
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-categories__mobile-list">
            {filteredCategories.map((category) => (
              <article key={category.key} className="admin-categories__mobile-card">
                <div className="admin-categories__col-name">
                  <span className="admin-categories__pill">Loại món</span>
                  <h2 className="admin-categories__name">{category.name}</h2>
                </div>

                <p className="admin-categories__mobile-count">
                  {category.recipeCount} công thức
                </p>

                <div className="admin-categories__mobile-actions">
                  <button
                    type="button"
                    className="admin-categories__text-action"
                    onClick={(event) =>
                      handleOpenEdit(category, event.currentTarget)
                    }
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    className="admin-categories__text-action"
                    onClick={(event) =>
                      handleOpenDelete(category, event.currentTarget)
                    }
                  >
                    Xóa
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <p className="admin-categories__footnote">
        Loại món giúp thành viên tìm công thức dễ dàng hơn.
      </p>

      {isAddOpen && (
        <div
          className="admin-categories__modal-backdrop"
          role="presentation"
          onClick={handleCloseAdd}
        >
          <form
            className="admin-categories__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-category-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleCreateSubmit}
            noValidate
          >
            <h2 id="add-category-title">Thêm loại món</h2>

            <label htmlFor="add-category-input" className="admin-categories__modal-label">
              Tên loại món
            </label>
            <input
              ref={addInputRef}
              id="add-category-input"
              type="text"
              className={`admin-categories__modal-input${
                createError ? ' admin-categories__modal-input--error' : ''
              }`}
              placeholder="Nhập tên loại món..."
              value={newName}
              maxLength={MAX_NAME_LENGTH + 10}
              disabled={creating}
              aria-invalid={Boolean(createError)}
              onChange={(event) => {
                setNewName(event.target.value);
                if (createError) setCreateError('');
              }}
            />

            <p className="admin-categories__modal-hint">
              Nhập tên để thành viên dễ nhận biết.
            </p>

            <div className="admin-categories__preview-row">
              <span>Xem trước:</span>
              <span className="admin-categories__pill">{addPreviewText}</span>
            </div>

            {createError && (
              <p className="admin-categories__modal-error" role="alert">
                {createError}
              </p>
            )}

            <div className="admin-categories__modal-actions">
              <button
                type="button"
                className="admin-categories__btn admin-categories__btn--outline"
                disabled={creating}
                onClick={handleCloseAdd}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="admin-categories__btn admin-categories__btn--primary"
                disabled={creating}
              >
                {creating ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editTarget && (
        <div
          className="admin-categories__modal-backdrop"
          role="presentation"
          onClick={handleCloseEdit}
        >
          <form
            className="admin-categories__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-category-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSaveEdit}
            noValidate
          >
            <h2 id="edit-category-title">Chỉnh sửa loại món</h2>

            <label htmlFor="edit-category-input" className="admin-categories__modal-label">
              Tên loại món
            </label>
            <input
              ref={editInputRef}
              id="edit-category-input"
              type="text"
              className={`admin-categories__modal-input${
                editingError ? ' admin-categories__modal-input--error' : ''
              }`}
              placeholder="Nhập tên loại món..."
              value={editingName}
              maxLength={MAX_NAME_LENGTH + 10}
              disabled={savingEdit}
              aria-invalid={Boolean(editingError)}
              onChange={(event) => {
                setEditingName(event.target.value);
                if (editingError) setEditingError('');
              }}
            />

            <p className="admin-categories__modal-hint">
              Nhập tên để thành viên dễ nhận biết.
            </p>

            <div className="admin-categories__preview-row">
              <span>Xem trước:</span>
              <span className="admin-categories__pill">{editPreviewText}</span>
            </div>

            {editingError && (
              <p className="admin-categories__modal-error" role="alert">
                {editingError}
              </p>
            )}

            <div className="admin-categories__modal-actions">
              <button
                type="button"
                className="admin-categories__btn admin-categories__btn--outline"
                disabled={savingEdit}
                onClick={handleCloseEdit}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="admin-categories__btn admin-categories__btn--primary"
                disabled={savingEdit}
              >
                {savingEdit ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="admin-categories__modal-backdrop"
          role="presentation"
          onClick={handleCloseDelete}
        >
          <div
            className="admin-categories__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-category-title">Xóa loại món?</h2>
            <p className="admin-categories__modal-desc">
              Bạn có chắc chắn muốn xóa loại món “<strong>{deleteTarget.name}</strong>” không?
            </p>

            {deleteError && (
              <p className="admin-categories__modal-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="admin-categories__modal-actions">
              <button
                ref={cancelDeleteBtnRef}
                type="button"
                className="admin-categories__btn admin-categories__btn--outline"
                disabled={deleting}
                onClick={handleCloseDelete}
              >
                {deleteError ? 'Đóng' : 'Hủy'}
              </button>
              <button
                type="button"
                className="admin-categories__btn admin-categories__btn--danger"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`admin-categories__toast${
            toast.type === 'error' ? ' admin-categories__toast--error' : ''
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </section>
  );
}