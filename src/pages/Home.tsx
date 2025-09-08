import React from 'react'
import { useNavigate } from 'react-router-dom'
import ReusableHeader from '@/components/ReusableHeader'
import ReusableFooter from '@/components/ReusableFooter'
import LandingPage from '@/components/LandingPage'

const Home: React.FC = () => {
  const navigate = useNavigate()

  const handleTryApp = () => {
    navigate('/studio')
  }

  return (
    <>
      <ReusableHeader />
      <LandingPage onTryApp={handleTryApp} />
      <ReusableFooter />
    </>
  )
}

export default Home
