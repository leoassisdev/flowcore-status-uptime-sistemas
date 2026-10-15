// DashUptime · Criado por FlowCore Soluções LTDA · flowcoresolucoes.com.br/codigos · licença MIT
// Página de status dos sistemas: banner geral, serviços com barras de uptime de
// 90 dias (tooltip por dia), linha do tempo de incidentes e latência p50/p95.
// Pra usar dados reais, troque o array DADOS pela resposta da sua API de monitoramento.
// Props: accent (cor de destaque), dados (serviços, incidentes e latência), tema
// ("claro" | "escuro", padrão "claro") e onTemaChange (avisa quando o botão sol/lua troca).
// Requisitos: React 18+ e Tailwind CSS 3+. Zero dependências.

import { useState, type CSSProperties, type SyntheticEvent } from "react";

type Tema = "claro" | "escuro";
type Dia = { data: string; minutosFora: number };
type Servico = { nome: string; descricao: string; dias: Dia[] };
type Incidente = { data: string; titulo: string; servico: string; duracao: string; status: "resolvido" | "monitorando"; resumo: string };

// Paleta de cada tema, aplicada como CSS vars na raiz (não depende do dark: do Tailwind).
const TEMAS: Record<Tema, Record<string, string>> = {
  claro: {
    "--fc-bg": "#F7F8FB", "--fc-surface": "#FFFFFF", "--fc-surface-2": "#F1F4F9",
    "--fc-border": "#E3E8F0", "--fc-border-strong": "#CBD3E1",
    "--fc-text": "#0B1220", "--fc-muted": "#4B5565", "--fc-subtle": "#8A94A6",
    "--fc-pos": "#059669", "--fc-neg": "#E11D48", "--fc-warn": "#D97706",
    "--fc-shadow": "0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.18)",
    "--fc-pop": "#FFFFFF", "--fc-grid": "#EDF0F5",
  },
  escuro: {
    "--fc-bg": "#0B0F17", "--fc-surface": "rgba(255,255,255,0.03)", "--fc-surface-2": "rgba(255,255,255,0.06)",
    "--fc-border": "rgba(255,255,255,0.10)", "--fc-border-strong": "rgba(255,255,255,0.25)",
    "--fc-text": "#FFFFFF", "--fc-muted": "rgba(255,255,255,0.60)", "--fc-subtle": "rgba(255,255,255,0.40)",
    "--fc-pos": "#34D399", "--fc-neg": "#FB7185", "--fc-warn": "#FBBF24",
    "--fc-shadow": "0 24px 48px -24px rgba(0,0,0,.6)",
    "--fc-pop": "#111827", "--fc-grid": "rgba(255,255,255,0.06)",
  },
};
const PALETA = ["var(--accent)", "#7C3AED", "#10B981", "#F59E0B", "#EC4899", "#06B6D4"];
const tinta = (cor: string, pct: number) => `color-mix(in srgb, ${cor} ${pct}%, transparent)`;

// Tema controlado pela prop, mas o botão sol/lua troca por dentro.
function useTema(inicial: Tema, onTemaChange?: (t: Tema) => void) {
  const [tema, setTema] = useState<Tema>(inicial);
  const [prop, setProp] = useState<Tema>(inicial);
  if (prop !== inicial) {
    setProp(inicial);
    setTema(inicial);
  }
  const alternar = () => {
    const novo: Tema = tema === "claro" ? "escuro" : "claro";
    setTema(novo);
    onTemaChange?.(novo);
  };
  return [tema, alternar] as const;
}

function BotaoTema({ tema, onClick }: { tema: Tema; onClick: () => void }) {
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--fc-border)] bg-[var(--fc-surface)] text-[var(--fc-muted)] transition-colors hover:bg-[var(--fc-surface-2)] hover:text-[var(--fc-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {escuro ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
        )}
      </svg>
    </button>
  );
}

function gerador(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function historico(seed: number, falhas: number): Dia[] {
  const r = gerador(seed);
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(2026, 9, 15 - (89 - i));
    const x = r();
    const minutosFora = x < falhas * 0.15 ? 25 + Math.round(r() * 90) : x < falhas ? 1 + Math.round(r() * 8) : 0;
    return { data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }), minutosFora: i === 89 ? 0 : minutosFora };
  });
}

const DADOS: { servicos: Servico[]; incidentes: Incidente[]; latencia: { p50: number[]; p95: number[] } } = {
  servicos: [
    { nome: "API pública", descricao: "api.suaempresa.com.br", dias: historico(11, 0.025) },
    { nome: "Painel web", descricao: "app.suaempresa.com.br", dias: historico(23, 0.015) },
    { nome: "Pagamentos e Pix", descricao: "Gateway e conciliação", dias: historico(37, 0.035) },
    { nome: "Emissão de NF-e", descricao: "Integração SEFAZ", dias: historico(41, 0.07) },
    { nome: "Webhooks", descricao: "Entrega de eventos", dias: historico(53, 0.02) },
    { nome: "Banco de dados", descricao: "Cluster principal", dias: historico(67, 0.01) },
  ],
  incidentes: [
    { data: "12/10/2026 · 14:32", titulo: "Lentidão na emissão de NF-e", servico: "Emissão de NF-e", duracao: "47 min", status: "resolvido", resumo: "Instabilidade na SEFAZ-SP. Notas enfileiradas e emitidas automaticamente após normalização." },
    { data: "03/10/2026 · 09:10", titulo: "Atraso na entrega de webhooks", servico: "Webhooks", duracao: "18 min", status: "resolvido", resumo: "Fila de eventos acumulou após deploy. Workers escalados e reprocessamento concluído." },
    { data: "21/09/2026 · 22:05", titulo: "Falha intermitente no Pix", servico: "Pagamentos e Pix", duracao: "1h 12min", status: "resolvido", resumo: "Timeout no provedor de pagamentos. Ativado roteamento para o provedor secundário." },
  ],
  latencia: {
    p50: [82, 79, 76, 74, 75, 81, 92, 108, 121, 118, 114, 119, 124, 117, 112, 109, 115, 122, 119, 104, 96, 90, 86, 83],
    p95: [210, 198, 190, 185, 188, 205, 240, 290, 340, 322, 310, 335, 352, 330, 305, 298, 318, 342, 331, 280, 251, 236, 222, 214],
  },
};

const pct = (v: number) => `${v.toFixed(2).replace(".", ",")}%`;
const uptime = (dias: Dia[]) => 100 - (dias.reduce((s, d) => s + d.minutosFora, 0) / (dias.length * 1440)) * 100;
const cor = (m: number) => (m === 0 ? "var(--fc-pos)" : m < 15 ? "var(--fc-warn)" : "var(--fc-neg)");
const corUptime = (v: number) => (v >= 99.9 ? "var(--fc-pos)" : v >= 99 ? "var(--fc-warn)" : "var(--fc-neg)");

function Latencia({ p50, p95 }: { p50: number[]; p95: number[] }) {
  const W = 300;
  const H = 90;
  const max = Math.max(...p95) * 1.1;
  const linha = (v: number[]) => v.map((y, i) => `${(i / (v.length - 1)) * W},${H - (y / max) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-24 w-full" role="img" aria-label={`Latência nas últimas 24 horas: p50 atual ${p50[p50.length - 1]} ms, p95 atual ${p95[p95.length - 1]} ms`}>
      {[0.33, 0.66].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} vectorEffect="non-scaling-stroke" style={{ stroke: "var(--fc-grid)" }} />
      ))}
      <line x1="0" x2={W} y1={H - (250 / max) * H} y2={H - (250 / max) * H} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--fc-warn)", strokeOpacity: 0.55 }} />
      <polygon points={`0,${H} ${linha(p50)} ${W},${H}`} style={{ fill: tinta("var(--accent)", 10) }} />
      <polyline points={linha(p95)} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ stroke: PALETA[1], strokeOpacity: 0.75 }} />
      <polyline points={linha(p50)} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ stroke: "var(--accent)" }} />
    </svg>
  );
}

const Pilula = ({ cor: c, children }: { cor: string; children: string }) => (
  <span className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums" style={{ background: tinta(c, 12), color: c }}>
    {children}
  </span>
);

export default function DashUptime({
  accent = "#0057FF",
  dados = DADOS,
  tema = "claro",
  onTemaChange,
}: {
  accent?: string;
  dados?: typeof DADOS;
  tema?: Tema;
  onTemaChange?: (t: Tema) => void;
}) {
  const [modo, alternarTema] = useTema(tema, onTemaChange);
  const [dica, setDica] = useState<{ s: number; d: number; x: number; w: number } | null>(null);
  // Posição do tooltip medida no próprio elemento (funciona com 30 ou 90 barras visíveis).
  const marcar = (s: number, d: number) => (e: SyntheticEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    setDica({ s, d, x: el.offsetLeft + el.offsetWidth / 2, w: el.parentElement?.clientWidth ?? 0 });
  };
  const comProblema = dados.servicos.filter((s) => s.dias[s.dias.length - 1].minutosFora > 0);
  const ok = comProblema.length === 0;
  const geral = dados.servicos.reduce((s, sv) => s + uptime(sv.dias), 0) / dados.servicos.length;
  const corBanner = ok ? "var(--fc-pos)" : "var(--fc-warn)";

  return (
    <div style={{ ...TEMAS[modo], colorScheme: modo === "claro" ? "light" : "dark", "--accent": accent } as CSSProperties} data-tema={modo} className="min-h-full bg-[var(--fc-bg)] p-4 text-[var(--fc-text)] sm:p-6 lg:p-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--fc-subtle)]">Status dos sistemas · atualizado há 1 min</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Disponibilidade</h1>
        </div>
        <BotaoTema tema={modo} onClick={alternarTema} />
      </header>

      <div role="status" className="mt-6 flex items-center gap-3 rounded-2xl border p-4 shadow-[var(--fc-shadow)]" style={{ borderColor: tinta(corBanner, 25), background: tinta(corBanner, 8) }}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: tinta(corBanner, 16), color: corBanner }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 7v6m0 4h.01" />}
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{ok ? "Todos os sistemas operacionais" : `Degradação parcial em ${comProblema.map((s) => s.nome).join(", ")}`}</p>
          <p className="text-xs text-[var(--fc-muted)]">Uptime médio de 90 dias: {pct(geral)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <section className="min-w-0 rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-4 shadow-[var(--fc-shadow)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Serviços</h2>
            <span className="text-[11px] text-[var(--fc-subtle)]">
              <span className="sm:hidden">últimos 30 dias · use ← →</span>
              <span className="hidden sm:inline">últimos 90 dias · use ← →</span>
            </span>
          </div>
          <ul className="mt-4 space-y-5">
            {dados.servicos.map((sv, si) => {
              const atual = dica && dica.s === si ? sv.dias[dica.d] : null;
              const up = uptime(sv.dias);
              return (
                <li key={sv.nome}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-2 text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PALETA[si % PALETA.length] }} />
                      <span className="truncate font-medium">{sv.nome}</span>
                      <span className="hidden truncate text-xs text-[var(--fc-subtle)] sm:inline">{sv.descricao}</span>
                    </p>
                    <Pilula cor={corUptime(up)}>{pct(up)}</Pilula>
                  </div>
                  <div className="relative mt-2">
                    <div className="flex h-8 gap-[2px]" onMouseLeave={() => setDica(null)}>
                      {sv.dias.map((d, di) => (
                        <button
                          key={di}
                          type="button"
                          aria-label={`${sv.nome}, ${d.data}: ${d.minutosFora ? `${d.minutosFora} min fora do ar` : "sem incidentes"}`}
                          onMouseEnter={marcar(si, di)}
                          onFocus={marcar(si, di)}
                          tabIndex={di === sv.dias.length - 1 ? 0 : -1}
                          onKeyDown={(e) => {
                            const alvo = e.key === "ArrowLeft" ? e.currentTarget.previousElementSibling : e.key === "ArrowRight" ? e.currentTarget.nextElementSibling : null;
                            if (alvo) {
                              e.preventDefault();
                              (alvo as HTMLElement).focus();
                            }
                          }}
                          onBlur={() => setDica(null)}
                          style={{ background: cor(d.minutosFora) }}
                          className={`min-w-0 flex-1 rounded-[2px] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] ${di < 60 ? "hidden sm:block" : ""} ${d.minutosFora === 0 ? "opacity-80" : ""}`}
                        />
                      ))}
                    </div>
                    {atual && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full z-10 mb-2 w-44 rounded-lg border border-[var(--fc-border)] bg-[var(--fc-pop)] px-3 py-2 text-xs shadow-[var(--fc-shadow)]"
                        style={{ left: Math.max(0, Math.min(dica.w - 176, dica.x - 88)) }}
                      >
                        <p className="text-[var(--fc-muted)]">{atual.data}</p>
                        <p className="mt-0.5 font-medium" style={{ color: cor(atual.minutosFora) }}>
                          {atual.minutosFora ? `${atual.minutosFora} min de indisponibilidade` : "Operacional o dia todo"}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-[var(--fc-muted)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--fc-pos)]" />Operacional</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--fc-warn)]" />Instabilidade (&lt; 15 min)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[var(--fc-neg)]" />Indisponível</span>
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-4 shadow-[var(--fc-shadow)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Latência da API · 24h</h2>
              <div className="flex gap-3 text-[11px] text-[var(--fc-muted)]">
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded bg-[var(--accent)]" />p50</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-3 rounded" style={{ background: PALETA[1] }} />p95</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl px-3 py-2" style={{ background: tinta("var(--accent)", 8) }}>
                <p className="text-[11px] text-[var(--fc-muted)]">p50 agora</p>
                <p className="text-lg font-semibold tabular-nums">{dados.latencia.p50[dados.latencia.p50.length - 1]} ms</p>
              </div>
              <div className="rounded-xl px-3 py-2" style={{ background: tinta(PALETA[1], 8) }}>
                <p className="text-[11px] text-[var(--fc-muted)]">p95 agora</p>
                <p className="text-lg font-semibold tabular-nums">{dados.latencia.p95[dados.latencia.p95.length - 1]} ms</p>
              </div>
            </div>
            <div className="mt-3">
              <Latencia p50={dados.latencia.p50} p95={dados.latencia.p95} />
            </div>
            <p className="mt-1 text-[11px] text-[var(--fc-warn)]">Linha tracejada: limite de 250 ms do SLO</p>
          </section>

          <section className="rounded-2xl border border-[var(--fc-border)] bg-[var(--fc-surface)] p-4 shadow-[var(--fc-shadow)] sm:p-6">
            <h2 className="text-sm font-medium">Incidentes recentes</h2>
            <ol className="relative mt-4 space-y-5 border-l border-[var(--fc-border)] pl-5">
              {dados.incidentes.map((inc) => {
                const c = inc.status === "resolvido" ? "var(--fc-pos)" : "var(--fc-warn)";
                return (
                  <li key={inc.data} className="relative">
                    <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--fc-bg)]" style={{ background: c, boxShadow: `0 0 0 3px ${tinta(c, 18)}` }} />
                    <p className="text-[11px] tabular-nums text-[var(--fc-subtle)]">{inc.data} · {inc.duracao}</p>
                    <p className="mt-0.5 text-sm font-medium">{inc.titulo}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--fc-muted)]">{inc.resumo}</p>
                    <span className="mt-2 inline-flex">
                      <Pilula cor={c}>{inc.status === "resolvido" ? "Resolvido" : "Monitorando"}</Pilula>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>

      <footer className="mt-6 flex justify-end">
        <a href="https://flowcoresolucoes.com.br/codigos" target="_blank" rel="noopener" className="text-[11px] text-[var(--fc-subtle)] transition-colors hover:text-[var(--fc-text)]">
          Criado por FlowCore Soluções LTDA
        </a>
      </footer>
    </div>
  );
}
