import { createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage'
import WelcomeSplash from './pages/WelcomeSplash'
import InputForm from './pages/InputForm'
import LoadingScreen from './pages/LoadingScreen'
import ResultsPage from './pages/ResultsPage'
import PathDetail from './pages/PathDetail'
import NavigatorChat from './pages/NavigatorChat'
import HistoryPage from './pages/HistoryPage'
import ErrorState from './pages/ErrorState'
import ExplorePage from './pages/ExplorePage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/welcome', element: <WelcomeSplash /> },
  { path: '/input', element: <InputForm /> },
  { path: '/loading', element: <LoadingScreen /> },
  { path: '/results', element: <ResultsPage /> },
  { path: '/path/:id', element: <PathDetail /> },
  { path: '/chat/:id', element: <NavigatorChat /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/explore', element: <ExplorePage /> },
  { path: '/error', element: <ErrorState /> },
])

export default router
