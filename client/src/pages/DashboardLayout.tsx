import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import './Dashboard.css'

export default function DashboardLayout() {
  const { user, clear } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Customers
          </Link>
          <Link 
            to="/reporting" 
            className={`nav-link ${location.pathname === '/reporting' ? 'active' : ''}`}
          >
            Reporting
          </Link>
        </nav>
        <div className="dashboard-user-section">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name || 'U')}
            </div>
            <span>{user?.name}</span>
          </div>
          <button className="logout-button" onClick={() => { clear(); navigate('/login') }}>
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
