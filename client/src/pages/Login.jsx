import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [serverError, setServerError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: nextValue,
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
    const trimmedEmail = formValues.email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (!formValues.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(""); 
    setIsLoading(true);

    // Giả lập API gọi lên server
    setTimeout(() => {
      setIsLoading(false);
      // GIẢ LẬP LỖI ĐỂ TEST UI: Tài khoản không tồn tại / Sai mật khẩu
      setServerError("Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.");
      
      // MẸO: Khi nào nối API thật, chỗ này sẽ là:
      // try { await loginAPI(formValues) } 
      // catch (err) { setServerError(err.message) }
    }, 1000);
  };

  return (
    <main className="auth-page">
      <aside className="auth-page__banner" aria-hidden="true">
        <p className="auth-page__slogan">Mỗi ngày một món ăn</p>
      </aside>

      <section className="auth-page__panel" aria-labelledby="login-heading">
        <div className="auth-card">
          <Link to="/" className="auth-card__brand">
            Cooked
          </Link>

          <h1 id="login-heading" className="auth-card__title">
            Chào mừng trở lại
          </h1>
          <p className="auth-card__subtitle">
            Đăng nhập để lưu công thức và nấu ăn mỗi ngày.
          </p>

          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__field">
              <label htmlFor="login-email" className="auth-form__label">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="cooked2026est@example.com"
                value={formValues.email}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={`auth-form__input ${
                  errors.email ? "auth-form__input--error" : ""
                }`}
              />
              {errors.email && (
                <p
                  id="login-email-error"
                  className="auth-form__error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="auth-form__field">
              <label htmlFor="login-password" className="auth-form__label">
                Mật khẩu
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              
              {errors.password && (
                <p
                  id="login-password-error"
                  className="auth-form__error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
              <div className="auth-form__forgot-wrap">
                <Link to="/login" className="auth-form__forgot">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <label className="auth-form__remember">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formValues.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
                className="auth-form__checkbox"
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="auth-card__divider" role="separator">
            <span>hoặc</span>
          </div>

          <button
            type="button"
            className="auth-card__oauth"
            disabled={isLoading}
          >
            Tiếp tục với Google
          </button>

          <p className="auth-card__switch">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="auth-card__switch-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}