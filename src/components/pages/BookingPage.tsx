import React, { useState } from 'react';
import { Plane, Calendar, Users, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface BookingPageProps {
  onBack?: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({ onBack }) => {
  const [destination, setDestination] = useState('Rio de Janeiro (GIG)');
  const [passengers, setPassengers] = useState(2);
  const [booked, setBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 pb-24 select-text">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            data-morph-id="BUTTON_BACK_BOOKING"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <Plane className="w-4 h-4 text-purple-400" />
            Morph Viagens & Reservas
          </h1>
          <p className="text-[11px] text-slate-400">Passagens aéreas com confirmação segura</p>
        </div>
      </div>

      {booked ? (
        <div className="max-w-md mx-auto p-6 bg-slate-800/90 border border-emerald-500/40 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-emerald-300">Reserva Confirmada com Sucesso!</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sua reserva para <strong>{destination}</strong> ({passengers} passageiros) foi concluída após autorização no Morph Browser.
          </p>
          <button
            onClick={() => setBooked(false)}
            data-morph-id="BUTTON_RESET_BOOKING"
            className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-white transition"
          >
            Fazer Nova Reserva
          </button>
        </div>
      ) : (
        <form onSubmit={handleBook} className="max-w-md mx-auto space-y-4">
          <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200">
            <p className="font-semibold mb-0.5">Voo Direto: São Paulo (GRU) ➔ {destination}</p>
            <p className="text-slate-300 text-[11px]">Tarifa Total com taxas inclusas: <strong>R$ 1.150,00</strong></p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="select_destination">
              Destino
            </label>
            <select
              id="select_destination"
              data-morph-id="SELECT_DESTINATION"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Rio de Janeiro (GIG)">Rio de Janeiro (GIG)</option>
              <option value="Salvador (SSA)">Salvador (SSA)</option>
              <option value="Florianópolis (FLN)">Florianópolis (FLN)</option>
              <option value="Buenos Aires (EZE)">Buenos Aires (EZE)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_date">
                Data do Voo
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="input_date"
                  type="date"
                  data-morph-id="INPUT_DATE"
                  defaultValue="2026-11-15"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_passengers">
                Passageiros
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="input_passengers"
                  type="number"
                  min={1}
                  max={6}
                  data-morph-id="INPUT_PASSENGERS"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              data-morph-id="BUTTON_CONFIRM_RESERVATION"
              data-is-sensitive="true"
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              Confirmar Reserva e Pagamento (Ação Sensível)
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
