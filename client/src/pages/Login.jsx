import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import dishEgg from "../assets/banner/0001.png";
import dishPork from "../assets/banner/0002.png";
import dishBun from "../assets/banner/0003.png";
import dishBowl from "../assets/banner/0004.png";
import dishGreens from "../assets/banner/0005.png";
import dishTofu from "../assets/banner/0006.png";
import "./Login.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MOCK_USERS = [
  {
    id: "user-001",
    name: "Thành viên",
    email: "member@cooked.test",
    role: "member",
  },
  { id: "user-002", name: "Admin", email: "admin@cooked.test", role: "admin" },
];

function CleanDishImage({ src, alt }) {
  const [cleanedSrc, setCleanedSrc] = useState(src);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const total = w * h;
      const visited = new Uint8Array(total);
      const queue = new Int32Array(total);
      const minMainArea = Math.max(500, Math.floor(total * 0.005));

      for (let i = 0; i < total; i++) {
        if (visited[i] || data[i * 4 + 3] <= 12) continue;

        let head = 0;
        let tail = 0;
        queue[tail++] = i;
        visited[i] = 1;

        while (head < tail) {
          const curr = queue[head++];
          const x = curr % w;
          const y = (curr - x) / w;

          if (x > 0) {
            const left = curr - 1;
            if (!visited[left] && data[left * 4 + 3] > 12) {
              visited[left] = 1;
              queue[tail++] = left;
            }
          }
          if (x + 1 < w) {
            const right = curr + 1;
            if (!visited[right] && data[right * 4 + 3] > 12) {
              visited[right] = 1;
              queue[tail++] = right;
            }
          }
          if (y > 0) {
            const up = curr - w;
            if (!visited[up] && data[up * 4 + 3] > 12) {
              visited[up] = 1;
              queue[tail++] = up;
            }
          }
          if (y + 1 < h) {
            const down = curr + w;
            if (!visited[down] && data[down * 4 + 3] > 12) {
              visited[down] = 1;
              queue[tail++] = down;
            }
          }
        }

        if (tail < minMainArea) {
          for (let k = 0; k < tail; k++) {
            data[queue[k] * 4 + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      if (!cancelled) {
        setCleanedSrc(canvas.toDataURL("image/png"));
      }
    };

    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return <img src={cleanedSrc} alt={alt} />;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const nextErrors = {};
    if (
      !formValues.email.trim() ||
      !EMAIL_REGEX.test(formValues.email.trim())
    ) {
      nextErrors.email = "Email không hợp lệ";
    }
    if (!formValues.password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setServerError("");
    setIsLoading(true);

    const normalizedEmail = formValues.email.trim().toLowerCase();

    try {
      let userData = null;
      try {
        const res = await fetch(`${API_BASE}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formValues.password,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          const rawUser = json.data || json.user || json;
          userData = {
            id: rawUser.id || rawUser._id || "user-001",
            name: rawUser.fullName || rawUser.name || "Thành viên",
            email: rawUser.email || normalizedEmail,
            role: rawUser.role || "member",
          };
        }
      } catch {

      }

      if (!userData) {
        await new Promise((r) => setTimeout(r, 400));
        const matchedMock = MOCK_USERS.find((u) => u.email === normalizedEmail);
        userData = matchedMock || {
          id: `user-${Date.now()}`,
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
          role: "member",
        };
      }

      login(userData, { remember: formValues.rememberMe });
      navigate("/");
    } catch {
      setServerError("Email hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page--login">
      <aside
        className="auth-page__banner auth-page__banner--login"
        aria-hidden="true"
      >
        <div className="login-banner__art">
          <div className="login-banner__dish login-banner__dish--tofu">
            <CleanDishImage src={dishTofu} alt="" />
          </div>
          <div className="login-banner__dish login-banner__dish--pork">
            <CleanDishImage src={dishPork} alt="" />
          </div>
          <div className="login-banner__dish login-banner__dish--egg">
            <CleanDishImage src={dishEgg} alt="" />
          </div>
          <div className="login-banner__dish login-banner__dish--greens">
            <CleanDishImage src={dishGreens} alt="" />
          </div>
          <div className="login-banner__dish login-banner__dish--bowl">
            <CleanDishImage src={dishBowl} alt="" />
          </div>
          <div className="login-banner__dish login-banner__dish--bun">
            <CleanDishImage src={dishBun} alt="" />
          </div>
          <p className="login-banner__slogan">Mỗi ngày một món ăn</p>
        </div>
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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__field">
              <label htmlFor="login-email" className="auth-form__label">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="cooked2026est@example.com"
                value={formValues.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`auth-form__input ${errors.email ? "auth-form__input--error" : ""}`}
              />
              {errors.email && (
                <p className="auth-form__error">{errors.email}</p>
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
                  placeholder="••••••••"
                  value={formValues.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`auth-form__input auth-form__input--password ${errors.password || serverError ? "auth-form__input--error" : ""}`}
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
              {errors.password && (
                <p className="auth-form__error">{errors.password}</p>
              )}
              {serverError && <p className="auth-form__error">{serverError}</p>}
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

          <div className="auth-card__divider">
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