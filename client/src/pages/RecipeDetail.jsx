import "./RecipeDetail.css";
import lockIcon from "../../assets/lock-keyhole.svg";

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
        />

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
    </main>
  );
}

export default RecipeDetail;
