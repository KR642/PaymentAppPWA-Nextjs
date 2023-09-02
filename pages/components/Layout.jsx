// components/Layout.js

import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <BottomNav />
    </div>
  );
}
