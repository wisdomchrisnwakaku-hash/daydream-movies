import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎬</div>
            <h1 className="text-2xl font-bold text-gray-800">Daydream Movies</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-800 font-medium px-3 py-2 rounded-md bg-blue-100">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">FAQ</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 font-medium px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">Contact Us</a>
          </nav>
          
          <button className="md:hidden text-gray-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
