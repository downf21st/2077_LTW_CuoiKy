import { Outlet } from 'react-router-dom';
import useMenuSync from '../../hooks/useMenuSync';
import './MyAccountLayout.css';

export default function MyAccountLayout() {
  const { saveError, retrySave } = useMenuSync();

  return (
    <div className="my-account">
      {saveError && (
        <div className="my-account__sync-error" role="alert">
          <span>{saveError}</span>
          <button
            type="button"
            className="my-account__sync-retry"
            onClick={retrySave}
          >
            Thử lại
          </button>
        </div>
      )}
      <section className="my-account__content">
        <Outlet />
      </section>
    </div>
  );
}