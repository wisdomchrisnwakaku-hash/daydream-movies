import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
      <div className="max-w-4xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-red-600 to-purple-600 dark:from-white dark:via-red-400 dark:to-purple-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Everything you need to know about Daydream Movies and our revolutionary voice-to-scene technology.
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
            href="mailto:hello@daydreammovies.com"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ
