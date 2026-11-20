import dish38714 from "../assets/banner/0003.png";
import dishe28f2 from "../assets/banner/0006.png";
import dish737b8 from "../assets/banner/0002.png";
import dish8aaed from "../assets/banner/0001.png";
import dish75901 from "../assets/banner/0004.png";
import dishcad07 from "../assets/banner/0005.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./Login.css";
import "./Register.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const EXISTING_EMAILS = ["member@cooked.test", "admin@cooked.test"];

export default function Register() {
  const { register } = useAuth();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formValues.name.trim()) {
      nextErrors.name = "Vui lòng nhập họ tên";
    }
    if (
      !formValues.email.trim() ||
      !EMAIL_REGEX.test(formValues.email.trim())
    ) {
      nextErrors.email = "Email không hợp lệ";
    }
    if (!formValues.password || formValues.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (
      !formValues.confirmPassword ||
      formValues.confirmPassword !== formValues.password
    ) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    if (!formValues.acceptedTerms) {
      nextErrors.acceptedTerms =
        "Vui lòng đồng ý với Điều khoản và Chính sách bảo mật";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setIsLoading(true);

    const trimmedName = formValues.name.trim();
    const normalizedEmail = formValues.email.trim().toLowerCase();

    try {
      let createdUser = null;

      if (typeof register === "function") {
        await register({
          name: trimmedName,
          email: normalizedEmail,
          password: formValues.password,
        });
        setRegisteredEmail(normalizedEmail);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: trimmedName,
            name: trimmedName,
            email: normalizedEmail,
            password: formValues.password,
          }),
        });

        if (res.status !== 404) {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            const err = new Error(json.message || "Đăng ký thất bại");
            err.status = res.status;
            throw err;
          }
          const rawUser = json.data || json.user || json;
          createdUser = {
            id: rawUser.id || rawUser._id || `user-${Date.now()}`,
            name: rawUser.fullName || rawUser.name || trimmedName,
            email: rawUser.email || normalizedEmail,
            role: rawUser.role || "member",
          };
        }
      } catch (networkOrApiErr) {
        if (networkOrApiErr.status) {
          throw networkOrApiErr;
        }
      }

      if (!createdUser) {
        await new Promise((r) => setTimeout(r, 600));
        if (EXISTING_EMAILS.includes(normalizedEmail)) {
          const err = new Error("Email này đã được sử dụng.");
          err.status = 409;
          throw err;
        }
      }

      setRegisteredEmail(normalizedEmail);
    } catch (error) {
      if (error.status === 409 || error.message?.includes("409")) {
        setServerError(
          "Email này đã được sử dụng. Vui lòng chọn email khác (Lỗi 409).",
        );
      } else {
        setServerError(
          error.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <aside className="register-page__hero" aria-hidden="true">
        <div className="register-page__art">
          <div className="register-page__dish register-page__dish--bun">
            <img src={dish38714} alt="" />
          </div>
          <div className="register-page__dish register-page__dish--tofu">
            <img src={dishe28f2} alt="" />
          </div>
          <div className="register-page__dish register-page__dish--pork">
            <img src={dish737b8} alt="" />
          </div>
          <div className="register-page__dish register-page__dish--egg">
            <img src={dish8aaed} alt="" />
          </div>
          <div className="register-page__dish register-page__dish--bowl">
            <img src={dish75901} alt="" />
          </div>
          <div className="register-page__dish register-page__dish--greens">
            <img src={dishcad07} alt="" />
          </div>
          <p className="register-page__slogan">Nấu ngon, ăn khỏe</p>
        </div>
      </aside>

      <section className="auth-page__panel" aria-labelledby="register-heading">
        {registeredEmail ? (
          <div className="auth-card auth-card--success" role="status">
            <Link to="/" className="auth-card__brand">
              Cooked
            </Link>

            <h1
              id="register-heading"
              className="auth-card__title register-page__success-title"
            >
              Kiểm tra email của bạn
            </h1>

            <p className="auth-card__subtitle register-page__success-subtitle">
              Chúng tôi đã gửi liên kết xác nhận tới
              <br />
              <span className="register-page__success-email">
                {registeredEmail}.
              </span>
            </p>

            <Link
              to="/login"
              className="auth-form__submit register-page__success-btn"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <div className="auth-card">
            <Link to="/" className="auth-card__brand">
              Cooked
            </Link>

            <h1 id="register-heading" className="auth-card__title">
              Tạo tài khoản
            </h1>
            <p className="auth-card__subtitle">
              Lưu công thức yêu thích và nhận món ngon mỗi ngày.
            </p>

            {serverError && (
              <div className="auth-alert auth-alert--error" role="alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form__field">
                <label htmlFor="register-name" className="auth-form__label">
                  Họ và tên
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  value={formValues.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "register-name-error" : undefined
                  }
                  className={`auth-form__input ${
                    errors.name ? "auth-form__input--error" : ""
                  }`}
                />
                {errors.name && (
                  <p
                    id="register-name-error"
                    className="auth-form__error"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="auth-form__field">
                <label htmlFor="register-email" className="auth-form__label">
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="cooked2026est@example.com"
                  value={formValues.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "register-email-error" : undefined
                  }
                  className={`auth-form__input ${
                    errors.email ? "auth-form__input--error" : ""
                  }`}
                />
                {errors.email && (
                  <p
                    id="register-email-error"
                    className="auth-form__error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="auth-form__field">
                <label htmlFor="register-password" className="auth-form__label">
                  Mật khẩu
                </label>
                <div className="auth-form__input-wrapper">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={formValues.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password
                        ? "register-password-hint register-password-error"
                        : "register-password-hint"
                    }
                    className={`auth-form__input auth-form__input--password ${
                      errors.password ? "auth-form__input--error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    className="auth-form__toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                <p id="register-password-hint" className="register-page__hint">
                  Tối thiểu 6 ký tự.
                </p>
                {errors.password && (
                  <p
                    id="register-password-error"
                    className="auth-form__error"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="auth-form__field">
                <label
                  htmlFor="register-confirm-password"
                  className="auth-form__label"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword ? "register-confirm-error" : undefined
                  }
                  className={`auth-form__input ${errors.confirmPassword ? "auth-form__input--error" : ""}`}
                />
                {errors.confirmPassword && (
                  <p
                    id="register-confirm-error"
                    className="auth-form__error"
                    role="alert"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="auth-form__field">
                <label className="auth-form__remember register-page__terms">
                  <input
                    className="auth-form__checkbox"
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formValues.acceptedTerms}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.acceptedTerms)}
                    aria-describedby={
                      errors.acceptedTerms ? "register-terms-error" : undefined
                    }
                  />
                  <span>
                    Tôi đồng ý với <span>Điều khoản</span> và{" "}
                    <span>Chính sách bảo mật</span>
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p
                    id="register-terms-error"
                    className="auth-form__error"
                    role="alert"
                  >
                    {errors.acceptedTerms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={isLoading}
              >
                {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
              </button>
            </form>

            <div className="auth-card__divider" role="separator">
              <span>hoặc</span>
            </div>

            <button
              type="button"
              className="auth-card__oauth"
              disabled
              title="Chức năng chưa khả dụng"
            >
              Tiếp tục với Google
            </button>

            <p className="auth-card__switch">
              Đã có tài khoản?{" "}
              <Link to="/login" className="auth-card__switch-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}