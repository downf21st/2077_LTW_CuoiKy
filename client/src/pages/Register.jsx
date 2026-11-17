import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formValues.name.trim()) {
      nextErrors.name = "Vui lòng nhập họ tên";
    }
    if (!formValues.email.trim() || !EMAIL_REGEX.test(formValues.email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }
    if (!formValues.password || formValues.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
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
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <main className="auth-page">
      <aside className="auth-page__banner" aria-hidden="true">
        <p className="auth-page__slogan">Mỗi ngày một món ăn</p>
      </aside>

      <section className="auth-page__panel" aria-labelledby="register-heading">
        <div className="auth-card">
          <Link to="/" className="auth-card__brand">
            Cooked
          </Link>

          <h1 id="register-heading" className="auth-card__title">
            Tạo tài khoản mới
          </h1>
          <p className="auth-card__subtitle">
            Đăng ký để chia sẻ công thức và lưu những món ăn yêu thích.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__field">
              <label htmlFor="register-name" className="auth-form__label">
                Tên hiển thị
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
                aria-describedby={errors.name ? "register-name-error" : undefined}
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
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={formValues.password}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "register-password-error" : undefined
                }
                className={`auth-form__input ${
                  errors.password ? "auth-form__input--error" : ""
                }`}
              />
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

            <button
              type="submit"
              className="auth-form__submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
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
            Đã có tài khoản?{" "}
            <Link to="/login" className="auth-card__switch-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}