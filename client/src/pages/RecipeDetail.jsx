import "./RecipeDetail.css";
import lockIcon from "../assets/lock-keyhole.svg";
import recipePhoto from "../assets/images/ga-kho-gung.jpg";
function RecipeDetail() {
  return (
    <main className="recipe-detail">
      <nav className="recipe-detail__breadcrumb" aria-label="Breadcrumb">
        Trang chủ / Món ăn / Gà kho gừng
      </nav>

      <section className="recipe-detail__hero" aria-labelledby="recipe-title">
        <figure
          className="recipe-detail__photo"
          role="img"
          aria-label="Gà kho gừng"
        >
          <img
            className="recipe-detail__photo-image"
            src={recipePhoto}
            alt="Món gà kho gừng trong nồi đất"
            width="584"
            height="474"
          />
        </figure>

        <div className="recipe-detail__introduction">
          <p className="recipe-detail__kicker">BỮA CƠM NHÀ / MÓN KHO</p>
          <h1 className="recipe-detail__title" id="recipe-title">
            Gà kho gừng
          </h1>

          <div className="recipe-detail__author">
            <span className="recipe-detail__avatar" aria-hidden="true">
              D
            </span>
            <span>Công thức của Đông</span>
          </div>

          <p className="recipe-detail__description">
            Món kho thân quen cho bữa cơm ấm cúng: gà mềm, thơm nồng vị gừng, áo
            lớp sốt nước mắm đậm đà. Chỉ cần thêm bát cơm nóng là đủ ngon.
          </p>

          <div className="recipe-detail__rating">
            <span className="recipe-detail__stars" aria-hidden="true">
              ★★★★★
            </span>
            <span>4,8/5 · 128 đánh giá</span>
          </div>

          <div className="recipe-detail__stats">
            <div className="recipe-detail__stat">
              <span>45 phút</span>
              <span className="recipe-detail__stat-label">
                15′ chuẩn bị · 30′ nấu
              </span>
            </div>
            <div className="recipe-detail__stat">
              <span>Dễ</span>
              <span className="recipe-detail__stat-label">Độ khó</span>
            </div>
            <div className="recipe-detail__stat">
              <span>4 người</span>
              <span className="recipe-detail__stat-label">Khẩu phần</span>
            </div>
          </div>

          <button
            className="recipe-detail__button recipe-detail__button--primary"
            type="button"
          >
            Bắt đầu nấu
          </button>
          <p className="recipe-detail__note">
            Nấu từng bước, không cần đăng nhập.
          </p>
        </div>
      </section>

      <section
        className="recipe-detail__guest"
        aria-label="Tính năng dành cho thành viên"
      >
        <p className="recipe-detail__guest-message">
          <img className="recipe-detail__lock-icon" src={lockIcon} alt="" />
          Đăng nhập để lưu món yêu thích và lên thực đơn tuần.
        </p>
        <div className="recipe-detail__guest-actions">
          <button
            className="recipe-detail__button recipe-detail__button--locked"
            type="button"
          >
            Lưu yêu thích
          </button>
          <button
            className="recipe-detail__button recipe-detail__button--locked"
            type="button"
          >
            Thêm vào thực đơn tuần
          </button>
          <button
            className="recipe-detail__button recipe-detail__button--primary recipe-detail__button--login"
            type="button"
          >
            Đăng nhập
          </button>
        </div>
      </section>
      <div className="recipe-detail__content">
        <section
          className="recipe-detail__ingredients"
          aria-labelledby="ingredients-heading"
        >
          <div className="recipe-detail__ingredient-card">
            <h2
              className="recipe-detail__section-title"
              id="ingredients-heading"
            >
              Nguyên liệu
            </h2>
            <div className="recipe-detail__servings">
              <span>Cho 4 người</span>
              <span className="recipe-detail__ingredient-count">
                9 nguyên liệu
              </span>
            </div>
            <p className="recipe-detail__helper">
              Đánh dấu những thứ bạn đã chuẩn bị.
            </p>
            <ul className="recipe-detail__ingredient-list">
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Thịt đùi gà, chặt miếng
                </label>
                <span className="recipe-detail__amount">800 g</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Gừng tươi, thái sợi
                </label>
                <span className="recipe-detail__amount">50 g</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Hành tím, băm nhỏ
                </label>
                <span className="recipe-detail__amount">2 củ</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Tỏi, băm nhỏ
                </label>
                <span className="recipe-detail__amount">3 tép</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Nước mắm
                </label>
                <span className="recipe-detail__amount">3 muỗng canh</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Đường
                </label>
                <span className="recipe-detail__amount">1½ muỗng canh</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Dầu ăn
                </label>
                <span className="recipe-detail__amount">1 muỗng canh</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Tiêu xay
                </label>
                <span className="recipe-detail__amount">½ muỗng cà phê</span>
              </li>
              <li className="recipe-detail__ingredient">
                <label className="recipe-detail__ingredient-label">
                  <input type="checkbox" /> Nước lọc
                </label>
                <span className="recipe-detail__amount">150 ml</span>
              </li>
            </ul>
            <p className="recipe-detail__conversion">
              1 muỗng canh = 15 ml
              <br />1 muỗng cà phê = 5 ml
            </p>
          </div>
          <aside className="recipe-detail__tip">
            <h3 className="recipe-detail__tip-title">Nhỏ mà có võ</h3>
            <p>
              Chọn gừng ta để món kho thơm hơn. Chia gừng làm hai lần cho vào
              nồi: một lần để dậy mùi, một lần để giữ vị ấm cay.
            </p>
          </aside>
        </section>

        <section
          className="recipe-detail__instructions"
          aria-labelledby="instructions-heading"
        >
          <h2
            className="recipe-detail__section-title"
            id="instructions-heading"
          >
            Cách làm
          </h2>
          <p className="recipe-detail__helper">
            6 bước đơn giản, một nồi cơm nhà thật ngon.
          </p>
          <ol className="recipe-detail__step-list">
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                1
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">
                  Sơ chế nguyên liệu
                </h3>
                <p className="recipe-detail__step-duration">5 phút</p>
                <p className="recipe-detail__step-description">
                  Thấm khô gà bằng giấy bếp, chặt miếng vừa ăn. Gừng cạo vỏ,
                  thái sợi; hành tím và tỏi bóc vỏ, băm nhỏ. Dùng dao, thớt
                  riêng cho gà sống và rửa tay, dụng cụ sau khi sơ chế.
                </p>
              </div>
            </li>
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                2
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">
                  Ướp gà cho thấm vị
                </h3>
                <p className="recipe-detail__step-duration">10 phút</p>
                <p className="recipe-detail__step-description">
                  Trộn gà với 2 muỗng canh nước mắm, ½ muỗng canh đường, ½ lượng
                  hành tỏi và ¼ muỗng cà phê tiêu. Ướp 10 phút trong ngăn mát tủ
                  lạnh.
                </p>
              </div>
            </li>
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                3
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">
                  Thắng màu, phi thơm
                </h3>
                <p className="recipe-detail__step-duration">5 phút</p>
                <p className="recipe-detail__step-description">
                  Cho dầu ăn và 1 muỗng canh đường còn lại vào nồi, đun lửa nhỏ
                  đến màu hổ phách. Thêm hành tỏi còn lại cùng ½ lượng gừng, đảo
                  thơm; tránh để đường cháy đắng.
                </p>
              </div>
            </li>
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                4
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">Đảo gà săn lại</h3>
                <p className="recipe-detail__step-duration">5 phút</p>
                <p className="recipe-detail__step-description">
                  Cho gà cùng phần nước ướp vào nồi. Tăng lên lửa vừa, đảo
                  khoảng 5 phút để các mặt gà săn lại và áo đều màu. Cẩn thận
                  khi cho gà vào vì dầu có thể bắn.
                </p>
              </div>
            </li>
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                5
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">Kho nhỏ lửa</h3>
                <p className="recipe-detail__step-duration">15 phút</p>
                <p className="recipe-detail__step-description">
                  Thêm 150 ml nước lọc và 1 muỗng canh nước mắm còn lại. Đun
                  sôi, hạ lửa nhỏ, đậy hé nắp và kho 15 phút. Trở gà một lần để
                  thấm đều; thêm chút nước nóng nếu nồi cạn sớm.
                </p>
              </div>
            </li>
            <li className="recipe-detail__step">
              <span className="recipe-detail__step-number" aria-hidden="true">
                6
              </span>
              <div className="recipe-detail__step-content">
                <h3 className="recipe-detail__step-title">
                  Hoàn thiện và thưởng thức
                </h3>
                <p className="recipe-detail__step-duration">5 phút</p>
                <p className="recipe-detail__step-description">
                  Thêm gừng và tiêu còn lại, mở nắp kho 5 phút cho sốt sánh. Đo
                  phần thịt dày nhất, không chạm xương: gà cần đạt ít nhất 74°C;
                  nếu chưa đạt, kho thêm đến khi chín an toàn. Dọn nóng cùng cơm
                  trắng.
                </p>
              </div>
            </li>
          </ol>
          <div className="recipe-detail__invitation">
            <h3 className="recipe-detail__invitation-title">
              Sẵn sàng vào bếp?
            </h3>
            <p className="recipe-detail__helper">
              Chuyển sang chế độ nấu để xem từng bước rõ ràng hơn.
            </p>
            <button
              className="recipe-detail__button recipe-detail__button--primary recipe-detail__invitation-button"
              type="button"
            >
              Bắt đầu nấu
            </button>
          </div>
        </section>
      </div>
      <section
        className="recipe-detail__reviews"
        aria-labelledby="reviews-heading"
      >
        <h2 className="recipe-detail__section-title" id="reviews-heading">
          Chuyện từ căn bếp
        </h2>
        <p className="recipe-detail__helper">
          Những chia sẻ sau mỗi lần vào bếp.
        </p>
        <div className="recipe-detail__reviews-layout">
          <div className="recipe-detail__community">
            <div className="recipe-detail__review-summary">
              <p className="recipe-detail__average">4,8</p>
              <div>
                <p className="recipe-detail__stars" aria-hidden="true">
                  ★★★★★
                </p>
                <p className="recipe-detail__helper">
                  Trên 5 sao · 128 đánh giá
                </p>
              </div>
            </div>
            <p className="recipe-detail__review-count">
              Hiển thị 3 trong 128 đánh giá
            </p>
            <article className="recipe-detail__review">
              <div className="recipe-detail__reviewer">
                <span
                  className="recipe-detail__review-avatar"
                  aria-hidden="true"
                >
                  HT
                </span>
                <div className="recipe-detail__reviewer-info">
                  <p>Hà Thoại</p>
                  <time
                    className="recipe-detail__review-date"
                    dateTime="2026-11-02"
                  >
                    02/11/2026
                  </time>
                </div>
                <p className="recipe-detail__review-score">
                  <span aria-hidden="true">★★★★★</span> 5/5
                </p>
              </div>
              <p>
                Gà mềm, vị gừng rất thơm. Mình làm đúng lượng nước mắm, ăn với
                cơm nóng vừa miệng cả nhà. Sẽ nấu lại!
              </p>
            </article>
            <article className="recipe-detail__review">
              <div className="recipe-detail__reviewer">
                <span
                  className="recipe-detail__review-avatar"
                  aria-hidden="true"
                >
                  DA
                </span>
                <div className="recipe-detail__reviewer-info">
                  <p>Duy Anh</p>
                  <time
                    className="recipe-detail__review-date"
                    dateTime="2026-10-30"
                  >
                    30/10/2026
                  </time>
                </div>
                <p className="recipe-detail__review-score">
                  <span aria-hidden="true">★★★★★</span> 5/5
                </p>
              </div>
              <p>
                Lần đầu kho gà mà thành công. Hướng dẫn thắng màu rõ ràng, sốt
                lên màu đẹp và không bị đắng.
              </p>
            </article>
            <article className="recipe-detail__review">
              <div className="recipe-detail__reviewer">
                <span
                  className="recipe-detail__review-avatar"
                  aria-hidden="true"
                >
                  HN
                </span>
                <div className="recipe-detail__reviewer-info">
                  <p>Hải Nam</p>
                  <time
                    className="recipe-detail__review-date"
                    dateTime="2026-10-28"
                  >
                    28/10/2026
                  </time>
                </div>
                <p className="recipe-detail__review-score">
                  <span aria-hidden="true">★★★★☆</span> 4/5
                </p>
              </div>
              <p>
                Món ngon, dễ làm. Nhà mình ăn nhạt nên lần sau sẽ giảm chút nước
                mắm. Cho gừng ở cuối giúp mùi thơm hơn hẳn.
              </p>
            </article>
            <button
              className="recipe-detail__button recipe-detail__button--outline"
              type="button"
            >
              Xem thêm đánh giá
            </button>
          </div>

          <form className="recipe-detail__review-form">
            <h3 className="recipe-detail__review-form-title">
              Bữa cơm của bạn thế nào?
            </h3>
            <p className="recipe-detail__review-login-hint">
              <img className="recipe-detail__lock-icon" src={lockIcon} alt="" />{" "}
              Đăng nhập để đánh giá và bình luận.
            </p>
            <button
              className="recipe-detail__button recipe-detail__button--primary recipe-detail__review-form-button"
              type="button"
            >
              Đăng nhập
            </button>
            <fieldset className="recipe-detail__rating-field" disabled>
              <legend className="recipe-detail__rating-legend">
                Điểm của bạn · Chưa đăng nhập
              </legend>
              <div className="recipe-detail__rating-options">
                <button
                  className="recipe-detail__rating-star"
                  type="button"
                  aria-label="1 sao"
                >
                  ☆
                </button>
                <button
                  className="recipe-detail__rating-star"
                  type="button"
                  aria-label="2 sao"
                >
                  ☆
                </button>
                <button
                  className="recipe-detail__rating-star"
                  type="button"
                  aria-label="3 sao"
                >
                  ☆
                </button>
                <button
                  className="recipe-detail__rating-star"
                  type="button"
                  aria-label="4 sao"
                >
                  ☆
                </button>
                <button
                  className="recipe-detail__rating-star"
                  type="button"
                  aria-label="5 sao"
                >
                  ☆
                </button>
              </div>
            </fieldset>
            <label className="recipe-detail__comment-label">
              Bình luận của bạn
              <textarea
                className="recipe-detail__comment"
                placeholder="Viết cảm nhận của bạn…"
                disabled
              />
            </label>
            <button
              className="recipe-detail__button recipe-detail__button--disabled recipe-detail__review-form-button"
              type="submit"
              disabled
            >
              Gửi đánh giá
            </button>
            <p className="recipe-detail__review-form-note">
              Chưa thể gửi khi chưa đăng nhập.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RecipeDetail;
