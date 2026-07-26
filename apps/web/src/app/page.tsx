export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-center font-sans text-4xl font-bold">
          Bem-vindo ao <span className="text-accent">Saldu</span>
        </h1>
        <p className="text-secondary mb-12 text-center font-sans">
          Seu gerenciador de finanças pessoal.
        </p>
        <div className="flex justify-center">
          <div className="bg-surface-elevated border-subtle w-96 rounded-2xl border p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-secondary font-sans text-sm">Saldo Atual</span>
              <span className="bg-positive/20 text-positive rounded px-2 py-1 text-xs font-semibold uppercase">
                Efetivado
              </span>
            </div>
            <div className="font-mono text-4xl font-medium tracking-tight">R$ 14.500,00</div>
          </div>
        </div>
      </div>
    </main>
  );
}
