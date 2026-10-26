import { MotionConfig } from 'framer-motion'
import { Cursor } from './components/Cursor'
import { Header } from './components/Header'
import { SpiderLayer } from './components/spider/SpiderLayer'
import { Contact, Footer } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Mindset } from './sections/Mindset'
import { Profile } from './sections/Profile'
import { Projects } from './sections/Projects'
import { TechStack } from './sections/TechStack'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#perfil"
        className="sr-only z-[90] bg-accent px-4 py-3 font-mono text-sm text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <Profile />
        <Projects />
        <Mindset />
        <TechStack />
        <Contact />
      </main>
      <Footer />
      <SpiderLayer />
      <Cursor />
      <div aria-hidden className="grain" />
    </MotionConfig>
  )
}
