import { Outlet, NavLink, useNavigate } from "react-router-dom"
import styles from "./Layout.module.css"

export function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandText}>Ansar Forms</span>
        </div>
        <nav className={styles.navWrap}>
          <ul className={styles.nav}>
            <li className={styles.navItem}>
              <NavLink
                to="/forms"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <span className={styles.navIcon}>📋</span>
                Мои формы
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <span className={styles.navIcon}>→</span>
            Выйти
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
