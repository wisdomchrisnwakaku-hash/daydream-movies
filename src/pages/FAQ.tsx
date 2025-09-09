import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import ReusableHeader from '@/components/ReusableHeader'
import ReusableFooter from '@/components/ReusableFooter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FAQ: React.FC = () => {
  const { theme } = useTheme()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does the voice-to-scene generation work?",
      answer: "Our AI listens to your voice, tone, and volume to generate cinematic scenes in real-time. Shout and get dramatic scenes, whisper for gentle visuals."
    },
    {
      question: "What genres of stories can I create?",
      answer: "Everything! From bedtime fairytales to spooky campfire legends, educational content to meme-chaos with friends. The possibilities are limitless."
    },
    {
      question: "Is this really real-time?",
      answer: "Yes! No waiting, no edits. Your story builds as fast as you speak. Every word creates instant visual magic."
    },
    {
      question: "Can multiple people collaborate on stories?",
      answer: "Coming soon! We're building Party Mode for multiplayer storytelling where voices clash and worlds collide."
    },
    {
      question: "What's the difference between this and other AI tools?",
      answer: "This isn't pre-rendered or scripted. It's 100% alive with your voice. You don't watch the story — you become it."
    },
    {
      question: "Can I use this app for all my video editing needs?",
      answer: "Yes! Our AI-powered video editing app handles everything from basic trimming to advanced effects and background removal."
    },
    {
      question: "How does the AI video editing work?",
      answer: "Our AI analyzes your video content and automatically applies smart editing techniques, effects, and optimizations."
    },
    {
      question: "What video formats are supported?",
      answer: "We support 10+ export formats including MP4, MOV, AVI, and more, with up to 4K resolution on premium plans."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a free starter plan with basic editing features and a 7-day trial for premium features."
    },
    {
      question: "Can I collaborate with my team?",
      answer: "Absolutely! Our Agency plan includes team collaboration features, shared templates, and multi-user access."
    }
  ]

  return (
    <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'} min-h-screen`}>
      <ReusableHeader />
      
      <div className="max-w-7xl mx-auto px-8 py-20">
        {/* About Section */}
        <div className="mb-20">
          <Card className={`shadow-lg border-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                About Vox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Vox is the world's first real-time Storytelling Scene Generator designed to revolutionize how content creators 
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
                  Why Choose Vox?
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

        {/* FAQ Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-600 to-purple-600 dark:from-white dark:via-red-400 dark:to-purple-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Everything you need to know about Vox and our revolutionary voice-to-scene technology.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className={`border ${theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} rounded-lg p-6 transition-all duration-200 hover:shadow-lg`}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-lg font-semibold pr-4">{faq.question}</span>
                {expandedFaq === index ? (
                  <Minus className="w-6 h-6 text-red-500 flex-shrink-0" />
                ) : (
                  <Plus className="w-6 h-6 text-red-500 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
            Still have questions? We're here to help!
          </p>
          <a 
            href="mailto:hello@vox.com"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Contact Support
          </a>
        </div>
      </div>
      
      <ReusableFooter />
    </div>
  )
}

export default FAQ
