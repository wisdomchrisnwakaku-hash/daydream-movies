import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const Header: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-3xl">🎬</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">DayDream Movies</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/studio" 
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/studio') 
                  ? 'text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Studio
            </Link>
            <Link 
              to="/about" 
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/about') 
                  ? 'text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive('/contact') 
                  ? 'text-gray-800 dark:text-white bg-blue-100 dark:bg-blue-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="md:hidden text-gray-600 dark:text-gray-300 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
