import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'

export default function SignInPage() {
  return (
    <PageWrapper>
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-on-surface">Sign in</h1>
        <p className="font-sans mt-4 text-on-surface-variant">
          Authentication is coming soon. Full sign-in experience will be added in a
          follow-up.
        </p>
        <Link
          to="/"
          className="font-sans mt-10 inline-flex items-center gap-2 text-sm font-medium text-primary-container hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </main>
    </PageWrapper>
  )
}
