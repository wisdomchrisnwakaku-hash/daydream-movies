import React from 'react'
import ReusableHeader from '@/components/ReusableHeader'
import ReusableFooter from '@/components/ReusableFooter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const About: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <ReusableHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                About Daydream Movies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Daydream Movies is the world's first real-time Storytelling Scene Generator designed to revolutionize how content creators 
                tell stories. Our mission is to make cinematic storytelling accessible 
                to everyone, regardless of their technical expertise.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To democratize storytelling by providing AI-powered tools that transform voice into cinematic scenes, 
                    allowing creators to focus on what matters most - their stories and creativity.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                    Our Mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To break down barriers in storytelling by offering intuitive, powerful, and accessible 
                    voice-to-scene tools that scale with creators' needs and ambitions.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  Why Choose Daydream Movies?
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• AI-powered storytelling that responds to your voice and tone</li>
                  <li>• Real-time scene generation as you speak</li>
                  <li>• Professional-grade cinematic output in seconds, not hours</li>
                  <li>• Limitless genres from fairytales to sci-fi adventures</li>
                  <li>• Continuous innovation and feature updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ReusableFooter />
    </div>
  )
}

export default About
