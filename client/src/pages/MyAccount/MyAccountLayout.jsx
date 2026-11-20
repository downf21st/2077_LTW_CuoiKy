import { Outlet } from 'react-router-dom';
import './MyAccountLayout.css';

export default function MyAccountLayout() {
  return (
    <div className="my-account">
      <section className="my-account__content">
        <Outlet />
      </section>
    </div>
  );
}