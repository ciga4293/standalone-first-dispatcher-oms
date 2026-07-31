import DispatcherOncallClient from '@/components/DispatcherOncallClient'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <DispatcherOncallClient userName="Dispatcher Admin" role="admin" />
    </main>
  )
}
