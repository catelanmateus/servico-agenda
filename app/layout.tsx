import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ServiçoAgenda - Sistema de Agendamento',
  description: 'Sistema de agendamento online para barbeiros e salões de beleza',
  keywords: 'agendamento, barbeiro, salão, beleza, horário',
  authors: [{ name: 'ServiçoAgenda' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-4">
            <div className="max-w-md mx-auto px-4 text-center text-sm text-gray-500">
              © 2024 ServiçoAgenda - Todos os direitos reservados
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}