import { Outlet, NavLink } from "react-router-dom"
import styles from "./Layout.module.css"

export function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <nav>
          <ul className={styles.nav}>
            <li className={styles.navItem}>
              <NavLink
                to="/forms"
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                Главная
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
