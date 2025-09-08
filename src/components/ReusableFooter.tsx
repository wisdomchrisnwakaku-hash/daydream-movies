import React from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const ReusableFooter: React.FC = () => {
  const { theme } = useTheme()

  return (
    <footer className={`${theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t`}>
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold">Daydream Movies</span>
            </div>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              AI-powered storytelling for content creators. Transform your voice into cinematic scenes in real-time.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-2 text-sm">
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>hello@daydreammovies.com</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>+1 (555) 123-4567</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>123 Creator St, Digital City</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Style guide</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>User manual</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Changelog</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Instructions</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Terms of use</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Privacy policy</a>
              <a href="#" className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} block transition-colors`}>Cookie policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default ReusableFooter
