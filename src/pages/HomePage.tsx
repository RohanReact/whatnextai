import { useNavigate } from 'react-router-dom'
import { LandingScreen } from '../components/LandingScreen'
import PageWrapper from '../components/layout/PageWrapper'
import useAppStore from '../store/useAppStore'

export default function HomePage() {
  const navigate = useNavigate()
  const hasSeenWelcome = useAppStore((state) => state.hasSeenWelcome)

  return (
    <PageWrapper>
      <LandingScreen onGetUnstuck={() => navigate(hasSeenWelcome ? '/input' : '/welcome')} />
    </PageWrapper>
  )
}
