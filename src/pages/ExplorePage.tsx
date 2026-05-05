import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'

type ExploreItem = {
  id: string
  category: string
  title: string
  description: string
  users: string
}

const categories = ['All', 'Business', 'Tech', 'Learning', 'Career', 'Creative', 'Finance']

const items: ExploreItem[] = [
  {
    id: 'business-food',
    category: 'Business',
    title: "Want to start a food business but don't know where to begin",
    description: 'Registration, first customers, and payment setup covered.',
    users: '847 people',
  },
  {
    id: 'creative-youtube',
    category: 'Creative',
    title: 'Want to start YouTube but have no camera or editing skills',
    description: 'Phone-first approach, free tools, zero budget start.',
    users: '1.2k people',
  },
  {
    id: 'career-switch',
    category: 'Career',
    title: 'Stuck in one career path but want to switch to startup work',
    description: 'Risk map, skill transfer, and transition timeline.',
    users: '563 people',
  },
  {
    id: 'finance-saving',
    category: 'Finance',
    title: 'Want to start saving but nothing is left after expenses',
    description: 'Micro-saving system and starter plan examples.',
    users: '2.1k people',
  },
]

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const navigate = useNavigate()

  const filteredItems = useMemo(
    () => (activeCategory === 'All' ? items : items.filter((item) => item.category === activeCategory)),
    [activeCategory]
  )

  return (
    <PageWrapper>
      <main className="mx-auto min-h-[80vh] max-w-6xl px-6 pb-24 pt-28">
        <div className="rounded-2xl border border-white/10 bg-surface-container p-6">
          <h1 className="font-display text-3xl text-on-surface">Explore Situations</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Browse common stuck moments and see examples before trying your own.
          </p>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.08em] text-text-dim">Browse by category</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeCategory === category
                    ? 'border-primary-container/40 bg-primary-container/10 text-primary'
                    : 'border-white/10 bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.08em] text-text-dim">Popular situations</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-white/10 bg-surface-container-high p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">{item.category}</p>
                <h2 className="mt-2 text-sm font-semibold text-on-surface">{item.title}</h2>
                <p className="mt-2 text-xs text-text-dim">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1 text-[10px]">
                    <span className="rounded-full bg-green-500/15 px-2 py-1 text-green-300">Easy</span>
                    <span className="rounded-full bg-primary-container/15 px-2 py-1 text-primary">Medium</span>
                    <span className="rounded-full bg-red-500/15 px-2 py-1 text-red-300">Advanced</span>
                  </div>
                  <span className="text-[11px] text-text-dim">{item.users}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-r-xl border border-white/10 border-l-primary-container bg-surface-container-high p-4 text-sm text-on-surface-variant">
            <span className="font-semibold text-primary">None of these match your situation?</span> Describe yours and
            get personalized paths.
          </div>
          <button
            onClick={() => navigate('/input')}
            className="mt-4 w-full rounded-xl bg-primary-container px-4 py-3 font-semibold text-on-primary"
          >
            Get My Personalized Paths
          </button>
        </div>
      </main>
    </PageWrapper>
  )
}
