import {
  BarChart3,
  Check,
  Fingerprint,
  Lock,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30">
      {/* HERO */}
      <header className="relative px-6 pt-36 pb-24 md:pt-48 md:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute right-[10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />{' '}
              Pré-lançamento · Acesso antecipado
            </div>

            <h1 className="mb-6 text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-100 md:text-6xl">
              Controle seu patrimônio com{' '}
              <em className="bg-gradient-to-br from-emerald-400 to-teal-600/60 bg-clip-text text-transparent not-italic">
                precisão e elegância.
              </em>
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-400 md:text-xl">
              O Saldu redefine o gerenciamento financeiro pessoal. Uma interface minimalista, segura
              e focada na evolução do seu capital, sem o ruído das planilhas tradicionais.
            </p>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-emerald-500/30 transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                Solicitar Convite
              </Link>
              <Link
                href="/login"
                className="hover:bg-slate-900-elevated inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-7 py-3.5 text-base font-semibold text-slate-100 transition-all duration-200 active:scale-95"
              >
                Acessar Plataforma
              </Link>
            </div>

            <div className="text-sm text-slate-400/70">
              <b className="font-semibold text-slate-400">Ambiente fechado.</b> Acesso sob convite.
            </div>
          </div>

          {/* MOCKUP SHOWCASE */}
          <div className="relative animate-[float_7s_ease-in-out_infinite] rounded-[24px] border border-slate-800 bg-slate-900 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
              <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.35fr_1fr]">
              <div className="border-accent/20 from-surface to-canvas relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:row-span-2">
                <div className="relative z-10">
                  <div className="mb-2 text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                    Patrimônio Atual
                  </div>
                  <div className="mb-4 font-mono text-3xl tracking-tight text-slate-100">
                    R$ 15.500<span className="text-lg text-slate-400">,00</span>
                  </div>
                  <div className="mb-6 border-l-[3px] border-teal-500 pl-2 text-xs text-slate-400">
                    Saldo consolidado e efetivado
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 py-2 text-sm">
                    <span className="text-slate-400">Investimentos</span>
                    <span className="font-mono text-slate-100">R$ 120.500,00</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-400">Conta Corrente</span>
                    <span className="font-mono text-slate-100">R$ 25.000,00</span>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-xl" />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Rendimento Mês</span>
                  <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                    +2.4%
                  </span>
                </div>
                <div className="font-mono text-xl tracking-tight text-slate-100">R$ 3.490</div>
                <div className="mt-3 flex h-8 items-end gap-1 opacity-80">
                  <div className="h-[30%] w-full rounded-t-sm bg-emerald-500/30" />
                  <div className="h-[45%] w-full rounded-t-sm bg-emerald-500/40" />
                  <div className="h-[60%] w-full rounded-t-sm bg-emerald-500/50" />
                  <div className="h-[40%] w-full rounded-t-sm bg-emerald-500/70" />
                  <div className="h-[85%] w-full rounded-t-sm bg-emerald-500" />
                  <div className="h-[100%] w-full rounded-t-sm bg-teal-500" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="mb-3 text-xs font-semibold text-slate-400">Distribuição</div>
                <div className="mb-3 flex h-3 gap-1 overflow-hidden rounded-full">
                  <div className="w-[45%] bg-emerald-500" />
                  <div className="w-[30%] bg-teal-500" />
                  <div className="w-[25%] bg-amber-500" />
                </div>
                <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ações
                    </div>{' '}
                    <span className="font-mono text-slate-100">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-teal-500" /> Renda Fixa
                    </div>{' '}
                    <span className="font-mono text-slate-100">30%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TRUST ROW */}
      <div className="border-y border-slate-800 bg-slate-900/50 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-4 px-6 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-teal-400" /> Livre de planilhas complexas
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-teal-400" /> Estética premium e Dark Mode nativo
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-teal-400" /> Foco em dados efetivados
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-teal-400" /> Web e mobile
          </div>
        </div>
      </div>

      {/* SEGURANÇA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <span className="mb-3 block text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
              Segurança em Primeiro Lugar
            </span>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-100 md:text-4xl">
              Seus dados blindados.
            </h2>
            <p className="text-lg text-slate-400">
              O Saldu prioriza a sua privacidade. Nenhuma conexão bancária obrigatória, nenhuma
              venda de dados. Controle total nas suas mãos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-800/80">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[15px] font-bold text-slate-100">Conta Exclusiva</h3>
              <p className="text-sm text-slate-400">
                Arquitetura focada na segurança do usuário, com isolamento lógico de cada conta.
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-800/80">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[15px] font-bold text-slate-100">Privacidade Pura</h3>
              <p className="text-sm text-slate-400">
                Você cadastra suas informações livremente. Sem integrações obscuras rastreando sua
                vida.
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-800/80">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Fingerprint className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[15px] font-bold text-slate-100">Acesso Restrito</h3>
              <p className="text-sm text-slate-400">
                O acesso à plataforma é controlado e restrito a convidados para garantir a
                estabilidade.
              </p>
            </div>

            <div className="rounded-[20px] border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-800/80">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[15px] font-bold text-slate-100">Alta Performance</h3>
              <p className="text-sm text-slate-400">
                Navegação sem engasgos com a tecnologia mais recente do ecosistema React.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS BENTO BOX */}
      <section className="border-t border-slate-800 bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <span className="mb-3 block text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
              Ferramentas de Evolução
            </span>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-100 md:text-4xl">
              Interface limpa para decisões claras.
            </h2>
            <p className="text-lg text-slate-400">
              Acompanhe métricas vitais e distribua suas categorias com um olhar analítico e direto.
              Todo lançamento considera estritamente a efetivação no saldo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Bento Card 1 */}
            <div className="group rounded-[24px] border border-slate-800 bg-slate-950 p-8 transition-all duration-200 hover:border-emerald-500/30 hover:bg-slate-900">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-100">Gestão de Categorias</h3>
              <p className="mb-6 text-[15px] text-slate-400">
                Agrupe lançamentos em múltiplos níveis de detalhamento. Cores e insights gerados
                perfeitamente para entender para onde vai seu dinheiro.
              </p>

              <div className="mt-auto flex items-center gap-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex-1">
                  <div className="mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Rendimento Histórico
                  </div>
                  <div className="mb-2 font-mono text-2xl text-teal-400">+ 24,5%</div>
                  <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-800">
                    <div className="w-[70%] bg-teal-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="group rounded-[24px] border border-slate-800 bg-slate-950 p-8 transition-all duration-200 hover:border-emerald-500/30 hover:bg-slate-900">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-100">Rigor no Domínio</h3>
              <p className="mb-6 text-[15px] text-slate-400">
                Trate pendências visualmente de forma distinta. O invariante do sistema garante que
                seu saldo real apenas inclua lançamentos efetivados.
              </p>

              <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Efetivado</span>
                  <span className="font-mono text-teal-400">R$ 1.500,00</span>
                </div>
                <div className="border-l-[3px] border-slate-500 py-1 pl-3">
                  <span className="block text-xs text-slate-400">
                    Lançamento pendente (tracejado)
                  </span>
                </div>
              </div>
            </div>

            {/* Bento Card 3 - Span 2 */}
            <div className="group rounded-[24px] border border-slate-800 bg-slate-950 p-8 transition-all duration-200 hover:border-emerald-500/30 hover:bg-slate-900 md:col-span-2">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-100">
                Relatórios de Alta Densidade
              </h3>
              <p className="mb-6 max-w-3xl text-[15px] text-slate-400">
                Tipografia Spline Sans Mono aplicada estritamente a números para garantir
                alinhamento tabular perfeito. Esqueça visuais bagunçados ao conferir extratos com
                centenas de linhas.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="mb-1 font-mono text-3xl text-teal-400">R$ 900</div>
                  <div className="text-xs text-slate-400">Aportes este mês</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="mb-1 font-mono text-3xl text-emerald-400">&lt; 50ms</div>
                  <div className="text-xs text-slate-400">Latência de renderização</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                  <div className="mb-1 font-mono text-3xl text-amber-400">2</div>
                  <div className="text-xs text-slate-400">Faturas abertas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-slate-800 bg-slate-950 px-6 py-32 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-100 md:text-5xl">
            Assuma o controle.
          </h2>
          <p className="mb-10 text-lg text-slate-400">
            Solicite um convite e eleve a gestão do seu patrimônio para um patamar profissional com
            o Saldu.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-emerald-500/30 transition-all duration-200 hover:brightness-110 active:scale-95"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-100">
            <div className="h-5 w-5 rounded-full bg-emerald-500" />
            Saldu
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/login" className="transition-colors hover:text-slate-100">
              Login
            </Link>
            <Link href="/register" className="transition-colors hover:text-slate-100">
              Registro
            </Link>
          </div>
          <div className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Saldu. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
