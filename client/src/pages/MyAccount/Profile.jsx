import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../api';
import useAuth from '../../hooks/useAuth';
import './Profile.css';

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  member: 'Thành viên',
};

const MAX_BIO_LENGTH = 500;

function getAvatarInitial(name, email) {
  const cleanedName = String(name || '').trim();
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/);
    return parts[parts.length - 1].charAt(0).toUpperCase();
  }
  const cleanedEmail = String(email || '').trim();
  return cleanedEmail ? cleanedEmail.charAt(0).toUpperCase() : 'U';
}

function normalizeHandle(raw, fallbackEmail = '') {
  const source = String(raw || '').trim();
  if (source) {
    const body = source.replace(/^@+/, '').replace(/[^a-zA-Z0-9._-]/g, '');
    return `@${body}`;
  }
  const email = String(fallbackEmail || '').trim();
  if (email.includes('@')) {
    const body = email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');
    return `@${body || 'member'}`;
  }
  return '@member';
}

function buildBaseline(user) {
  return {
    name: String(user?.name || user?.fullName || '').trim(),
    username: normalizeHandle(user?.username, user?.email),
    bio: String(user?.bio || '').slice(0, MAX_BIO_LENGTH),
    avatar: String(user?.avatar || ''),
  };
}

function compressAvatarFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được tệp ảnh.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(String(reader.result || ''));
      img.onload = () => {
        const maxSide = 256;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function PencilIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, role, updateUser, logout } = useAuth();

  const [savedData, setSavedData] = useState(() => buildBaseline(user));
  const [formData, setFormData] = useState(() => buildBaseline(user));
  const [editingField, setEditingField] = useState({
    name: false,
    username: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [pendingNav, setPendingNav] = useState(null);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const usernameInputRef = useRef(null);

  const userKey = user?.id || user?.email || '';
  useEffect(() => {
    const next = buildBaseline(user);
    setSavedData(next);
    setFormData(next);
    setEditingField({ name: false, username: false });
  }, [userKey]);

  const isDirty = useMemo(
    () =>
      formData.name.trim() !== savedData.name.trim() ||
      formData.username !== savedData.username ||
      formData.bio !== savedData.bio ||
      formData.avatar !== savedData.avatar,
    [formData, savedData]
  );

  useEffect(() => {
    if (feedback.type !== 'success') return;
    const timer = setTimeout(() => {
      setFeedback({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handleDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || anchor.target === '_blank') return;

      try {
        const nextUrl = new URL(anchor.href, window.location.origin);
        if (nextUrl.origin !== window.location.origin) return;
        const nextTarget = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
        if (nextUrl.pathname === pathname) return;

        event.preventDefault();
        event.stopPropagation();
        setPendingNav(nextTarget);
      } catch {
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [isDirty, pathname]);

  const displayEmail = user?.email || 'Chưa cập nhật';
  const roleLabel = ROLE_LABELS[role] || 'Thành viên';
  const avatarInitial = getAvatarInitial(formData.name, user?.email);

  const handleOpenAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Vui lòng chọn tệp hình ảnh hợp lệ.' });
      return;
    }

    try {
      const dataUrl = await compressAvatarFile(file);
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
      setFeedback({ type: '', text: '' });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Không thể tải ảnh từ thiết bị.',
      });
    }
  };

  const handleEnableField = (field) => {
    setEditingField((prev) => ({ ...prev, [field]: true }));
    setFeedback({ type: '', text: '' });
    setTimeout(() => {
      if (field === 'name') nameInputRef.current?.focus();
      if (field === 'username') usernameInputRef.current?.focus();
    }, 0);
  };

  const handleNameChange = (event) => {
    setFormData((prev) => ({ ...prev, name: event.target.value }));
    setFeedback({ type: '', text: '' });
  };

  const handleUsernameChange = (event) => {
    const cleanedBody = event.target.value
      .replace(/^@+/, '')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    setFormData((prev) => ({ ...prev, username: `@${cleanedBody}` }));
    setFeedback({ type: '', text: '' });
  };

  const handleBioChange = (event) => {
    const nextBio = event.target.value.slice(0, MAX_BIO_LENGTH);
    setFormData((prev) => ({ ...prev, bio: nextBio }));
    setFeedback({ type: '', text: '' });
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    const trimmedName = formData.name.trim();
    const cleanedHandle = normalizeHandle(formData.username, '');
    const handleBody = cleanedHandle.slice(1);

    if (!trimmedName) {
      setFeedback({ type: 'error', text: 'Tên hiển thị không được để trống.' });
      handleEnableField('name');
      return;
    }

    if (handleBody.length < 2) {
      setFeedback({
        type: 'error',
        text: 'Tên người dùng phải theo dạng @... (ít nhất 2 ký tự sau dấu @).',
      });
      handleEnableField('username');
      return;
    }

    const payload = {
      name: trimmedName,
      fullName: trimmedName,
      username: cleanedHandle,
      bio: formData.bio.trim(),
      avatar: formData.avatar,
    };

    setIsSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      await updateUserProfile(user?.id, payload);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Lưu thông tin thất bại. Vui lòng thử lại.',
      });
      setIsSaving(false);
      return;
    }

    const nextBaseline = {
      name: payload.name,
      username: payload.username,
      bio: payload.bio,
      avatar: payload.avatar,
    };

    updateUser(nextBaseline);
    setSavedData(nextBaseline);
    setFormData(nextBaseline);
    setEditingField({ name: false, username: false });
    setFeedback({ type: 'success', text: 'Đã lưu thông tin tài khoản thành công.' });
    setIsSaving(false);
  };

  const handleLogoutClick = () => {
    if (isDirty) {
      setPendingNav('__logout__');
      return;
    }
    logout();
    navigate('/');
  };

  const handleConfirmLeave = () => {
    const target = pendingNav;
    setPendingNav(null);
    setFormData(savedData);
    setEditingField({ name: false, username: false });

    if (target === '__logout__') {
      logout();
      navigate('/');
    } else if (typeof target === 'string') {
      navigate(target);
    }
  };

  return (
    <div className="profile-page">
      <nav className="profile-page__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="profile-page__breadcrumb-link">
          Trang chủ
        </Link>
        <span className="profile-page__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">Thông tin tài khoản</span>
      </nav>

      <header className="profile-page__header">
        <h1 className="profile-page__title">Thông tin tài khoản</h1>
        <p className="profile-page__subtitle">
          Thông tin cá nhân của bạn tại Cooked.
        </p>
      </header>

      <section className="profile-card" aria-label="Chi tiết thông tin tài khoản">
        <div className="profile-card__identity">
          <div className="profile-card__avatar-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-card__file-input"
              onChange={handleAvatarChange}
              aria-label="Chọn ảnh đại diện từ máy"
            />
            <button
              type="button"
              className="profile-card__avatar-trigger"
              onClick={handleOpenAvatarPicker}
              aria-label="Thay đổi ảnh đại diện"
              title="Bấm để thay đổi ảnh đại diện"
            >
              <span className="profile-card__avatar">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || 'Ảnh đại diện'}
                    className="profile-card__avatar-img"
                  />
                ) : (
                  <span aria-hidden="true">{avatarInitial}</span>
                )}
              </span>
              <span className="profile-card__avatar-edit-badge" aria-hidden="true">
                <PencilIcon size={13} />
              </span>
            </button>
          </div>

          <div className="profile-card__identity-info">
            <h2 className="profile-card__name">
              {formData.name || 'Chưa cập nhật'}
            </h2>
            <p className="profile-card__handle">{formData.username}</p>
          </div>
        </div>

        <dl className="profile-card__list">
          <div className="profile-card__row">
            <dt className="profile-card__label">Tên hiển thị</dt>
            <dd className="profile-card__value-wrap">
              {editingField.name ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  className="profile-card__input"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Nhập tên hiển thị"
                  maxLength={60}
                />
              ) : (
                <span className="profile-card__value">
                  {formData.name || 'Chưa cập nhật'}
                </span>
              )}
              <button
                type="button"
                className={`profile-card__icon-btn${
                  editingField.name ? ' profile-card__icon-btn--active' : ''
                }`}
                onClick={() => handleEnableField('name')}
                aria-label="Chỉnh sửa tên hiển thị"
                title="Chỉnh sửa tên hiển thị"
              >
                <PencilIcon />
              </button>
            </dd>
          </div>

          <div className="profile-card__row">
            <dt className="profile-card__label">Tên người dùng</dt>
            <dd className="profile-card__value-wrap">
              {editingField.username ? (
                <input
                  ref={usernameInputRef}
                  type="text"
                  className="profile-card__input"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="@tennguoidung"
                  maxLength={32}
                />
              ) : (
                <span className="profile-card__value">{formData.username}</span>
              )}
              <button
                type="button"
                className={`profile-card__icon-btn${
                  editingField.username ? ' profile-card__icon-btn--active' : ''
                }`}
                onClick={() => handleEnableField('username')}
                aria-label="Chỉnh sửa tên người dùng"
                title="Chỉnh sửa tên người dùng"
              >
                <PencilIcon />
              </button>
            </dd>
          </div>

          <div className="profile-card__row">
            <dt className="profile-card__label">Email</dt>
            <dd className="profile-card__value">{displayEmail}</dd>
          </div>

          {/* Vai trò */}
          <div className="profile-card__row">
            <dt className="profile-card__label">Vai trò</dt>
            <dd className="profile-card__value">{roleLabel}</dd>
          </div>

          <div className="profile-card__row profile-card__row--bio">
            <dt className="profile-card__label">
              <label htmlFor="profile-bio">Giới thiệu</label>
            </dt>
            <dd className="profile-card__bio-wrap">
              <textarea
                id="profile-bio"
                className="profile-card__textarea"
                rows={4}
                maxLength={MAX_BIO_LENGTH}
                value={formData.bio}
                onChange={handleBioChange}
                placeholder="Giới thiệu đôi nét về bản thân bạn..."
              />
              <span className="profile-card__char-count">
                {formData.bio.length} / {MAX_BIO_LENGTH} ký tự
              </span>
            </dd>
          </div>
        </dl>

        {feedback.text && (
          <p
            className={`profile-card__feedback profile-card__feedback--${feedback.type}`}
            role="status"
          >
            {feedback.text}
          </p>
        )}

        <div className="profile-card__footer">
          <button
            type="button"
            className="profile-card__logout-btn"
            onClick={handleLogoutClick}
          >
            Đăng xuất
          </button>

          <button
            type="button"
            className={`profile-card__save-btn${
              isDirty ? ' profile-card__save-btn--active' : ''
            }`}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </section>

      {pendingNav && (
        <div
          className="profile-warning-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-warning-title"
        >
          <div className="profile-warning-modal">
            <div className="profile-warning-modal__header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 id="unsaved-warning-title" className="profile-warning-modal__title">
                Cảnh báo: Chưa lưu thay đổi
              </h2>
            </div>

            <p className="profile-warning-modal__desc">
              Bạn đã chỉnh sửa thông tin cá nhân nhưng chưa bấm{' '}
              <strong>Lưu thông tin</strong>. Nếu rời khỏi trang này ngay bây giờ,
              mọi thay đổi sẽ bị mất.
            </p>

            <div className="profile-warning-modal__actions">
              <button
                type="button"
                className="profile-warning-modal__btn profile-warning-modal__btn--stay"
                onClick={() => setPendingNav(null)}
              >
                Ở lại lưu
              </button>
              <button
                type="button"
                className="profile-warning-modal__btn profile-warning-modal__btn--leave"
                onClick={handleConfirmLeave}
              >
                Vẫn rời khỏi trang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}