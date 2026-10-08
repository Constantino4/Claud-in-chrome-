import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  CreditCard,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface BetwayPortalPageProps {
  onBack?: () => void;
  onNavigate?: (url: string) => void;
}

interface MatchFixture {
  id: string;
  league: string;
  time: string;
  teamA: string;
  teamB: string;
  oddsA: number;
  oddsDraw: number;
  oddsB: number;
  isLive?: boolean;
}

export const BetwayPortalPage: React.FC<BetwayPortalPageProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sports' | 'live' | 'aviator' | 'casino'>('sports');
  const [selectedOdd, setSelectedOdd] = useState<{ match: string; pick: string; odd: number } | null>({
    match: 'Real Madrid vs Barcelona',
    pick: 'Real Madrid (1)',
    odd: 2.15,
  });
  const [stake, setStake] = useState<number>(100);
  const [betSuccess, setBetSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fixtures: MatchFixture[] = [
    {
      id: 'm1',
      league: 'UEFA Champions League',
      time: 'AO VIVO - 68\'',
      teamA: 'Real Madrid',
      teamB: 'Barcelona',
      oddsA: 2.15,
      oddsDraw: 3.40,
      oddsB: 3.10,
      isLive: true,
    },
    {
      id: 'm2',
      league: 'Premier League',
      time: 'Hoje, 20:45',
      teamA: 'Manchester City',
      teamB: 'Arsenal',
      oddsA: 1.85,
      oddsDraw: 3.65,
      oddsB: 4.20,
      isLive: false,
    },
    {
      id: 'm3',
      league: 'Moçambola (Moçambique)',
      time: 'Hoje, 15:30',
      teamA: 'Black Bulls',
      teamB: 'Costa do Sol',
      oddsA: 1.95,
      oddsDraw: 3.10,
      oddsB: 3.80,
      isLive: false,
    },
    {
      id: 'm4',
      league: 'Moçambola (Moçambique)',
      time: 'Amanhã, 15:00',
      teamA: 'Ferroviário de Maputo',
      teamB: 'União Desportiva do Songo',
      oddsA: 2.30,
      oddsDraw: 3.00,
      oddsB: 3.25,
      isLive: false,
    },
    {
      id: 'm5',
      league: 'La Liga',
      time: 'Amanhã, 21:00',
      teamA: 'Atlético de Madrid',
      teamB: 'Sevilla',
      oddsA: 1.65,
      oddsDraw: 3.80,
      oddsB: 5.50,
      isLive: false,
    },
  ];

  const filteredFixtures = fixtures.filter(
    (f) =>
      f.teamA.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.teamB.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.league.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const potentialPayout = selectedOdd ? (stake * selectedOdd.odd).toFixed(2) : '0.00';

  const handlePlaceBet = () => {
    setBetSuccess(true);
    setTimeout(() => setBetSuccess(false), 3000);
  };

  return (
    <div className="w-full min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans select-text pb-20">
      {/* Top Brand Navbar */}
      <header className="bg-black border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tighter text-white">bet</span>
            <span className="text-xl font-black tracking-tighter text-emerald-500">way</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Oficial
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.betway.co.mz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
          >
            Abrir URL <ExternalLink className="w-3 h-3" />
          </a>
          <button
            data-vision-id="BTN_ENTRAR"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Entrar
          </button>
          <button
            data-vision-id="BTN_REGISTO"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm shadow-emerald-500/20"
          >
            Registar
          </button>
        </div>
      </header>

      {/* Hero Banner with M-Pesa / Aviator Highlights */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-black p-4 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-emerald-400" /> Bónus de Boas-Vindas até 100%
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Apostas Desportivas & Aviator
            </h1>
            <p className="text-xs text-slate-300">
              Depósitos e levantamentos rápidos via <strong className="text-emerald-400">M-Pesa</strong> e <strong className="text-emerald-400">E-Mola</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 text-center px-3 shadow">
              <span className="text-[10px] text-slate-400 block font-mono">ODDS BOOST</span>
              <span className="text-sm font-black text-emerald-400">+25% Acumulador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('sports')}
            data-vision-id="TAB_FUTEBOL"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sports'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Futebol
          </button>
          <button
            onClick={() => setActiveTab('live')}
            data-vision-id="TAB_AO_VIVO"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Ao Vivo
          </button>
          <button
            onClick={() => setActiveTab('aviator')}
            data-vision-id="TAB_AVIATOR"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'aviator'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Aviator
          </button>
          <button
            onClick={() => setActiveTab('casino')}
            data-vision-id="TAB_CASINO"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'casino'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Casino
          </button>
        </div>

        {/* Live Search inside portal */}
        <div className="relative w-44 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            data-vision-id="INPUT_SEARCH_BETWAY"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Pesquisar equipa..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Content Area: Fixtures + Betslip */}
      <div className="max-w-6xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Match Fixtures */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              Jogos em Destaque & Moçambola
            </h2>
            <span className="text-xs text-slate-400">{filteredFixtures.length} jogos disponíveis</span>
          </div>

          <div className="space-y-2.5">
            {filteredFixtures.map((fix) => (
              <div
                key={fix.id}
                data-vision-id={`CARD_${fix.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2 transition shadow-sm"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">{fix.league}</span>
                  <span className={fix.isLive ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}>
                    {fix.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-white">
                    {fix.teamA} <span className="text-slate-500 font-normal">vs</span> {fix.teamB}
                  </div>
                </div>

                {/* Odds Buttons (1, X, 2) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    data-vision-id={`ODD_${fix.id}_1`}
                    onClick={() =>
                      setSelectedOdd({ match: `${fix.teamA} vs ${fix.teamB}`, pick: `${fix.teamA} (1)`, odd: fix.oddsA })
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-between transition border ${
                      selectedOdd?.match.includes(fix.teamA) && selectedOdd?.pick.includes('(1)')
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 hover:bg-slate-850 text-slate-200 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400">1</span>
                    <span>{fix.oddsA.toFixed(2)}</span>
                  </button>

                  <button
                    data-vision-id={`ODD_${fix.id}_X`}
                    onClick={() =>
                      setSelectedOdd({ match: `${fix.teamA} vs ${fix.teamB}`, pick: 'Empate (X)', odd: fix.oddsDraw })
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-between transition border ${
                      selectedOdd?.match.includes(fix.teamA) && selectedOdd?.pick.includes('(X)')
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 hover:bg-slate-850 text-slate-200 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400">X</span>
                    <span>{fix.oddsDraw.toFixed(2)}</span>
                  </button>

                  <button
                    data-vision-id={`ODD_${fix.id}_2`}
                    onClick={() =>
                      setSelectedOdd({ match: `${fix.teamA} vs ${fix.teamB}`, pick: `${fix.teamB} (2)`, odd: fix.oddsB })
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-between transition border ${
                      selectedOdd?.match.includes(fix.teamA) && selectedOdd?.pick.includes('(2)')
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 hover:bg-slate-850 text-slate-200 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400">2</span>
                    <span>{fix.oddsB.toFixed(2)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Aviator Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-black border border-rose-500/30 flex items-center justify-between gap-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <Flame className="w-4 h-4 text-rose-500" /> Aviator Moçambique
              </div>
              <p className="text-xs text-slate-300">
                Multiplicador atual em voo: <span className="font-mono font-bold text-emerald-400 text-sm">3.42x</span>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('aviator')}
              data-vision-id="BTN_JOGAR_AVIATOR"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition active:scale-95 shrink-0"
            >
              Jogar Agora
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Betslip */}
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 sticky top-16 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-sm text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Boletim de Apostas
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                1 Seleção
              </span>
            </div>

            {selectedOdd ? (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-200">
                    <span>{selectedOdd.pick}</span>
                    <span className="font-mono text-emerald-400 font-black">{selectedOdd.odd.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{selectedOdd.match}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold block">Valor da Aposta (MT / M-Pesa):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      data-vision-id="INPUT_STAKE"
                      value={stake}
                      onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-400">MT</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Retorno Potencial:</span>
                  <span className="text-base font-black font-mono text-emerald-400">{potentialPayout} MT</span>
                </div>

                <button
                  onClick={handlePlaceBet}
                  data-vision-id="BTN_APOSTAR"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition active:scale-95 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Apostar Agora
                </button>

                {betSuccess && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold text-center animate-fade-in">
                    ✓ Aposta simulada realizada com sucesso!
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Selecione uma odd nos jogos ao lado para montar seu boletim.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
