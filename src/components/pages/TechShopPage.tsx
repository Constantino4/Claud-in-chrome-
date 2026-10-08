import React, { useState } from 'react';
import { Smartphone, Star, ShoppingCart, ShieldAlert, Check, ArrowLeft, Filter } from 'lucide-react';

interface TechShopPageProps {
  onBack?: () => void;
}

export const TechShopPage: React.FC<TechShopPageProps> = ({ onBack }) => {
  const [cartCount, setCartCount] = useState(0);
  const [filterQuery, setFilterQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const products = [
    {
      id: 'prod_realme',
      name: 'Realme Note 50 (128GB)',
      price: 'R$ 689,00',
      numericPrice: 689.0,
      rating: 4.6,
      badge: 'Menor Preço',
      specs: ['Tela 6.74" 90Hz', '4GB RAM + 128GB', 'Bateria 5000mAh', 'Câmera 13MP AI'],
      color: 'from-amber-500 to-orange-600',
    },
    {
      id: 'prod_redmi',
      name: 'Xiaomi Redmi 13C (128GB)',
      price: 'R$ 749,00',
      numericPrice: 749.0,
      rating: 4.7,
      badge: 'Mais Vendido',
      specs: ['Processador Helio G85', '6GB RAM', 'Bateria 5000mAh Carga 18W', 'Câmera Tripla 50MP'],
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'prod_samsung',
      name: 'Samsung Galaxy A15 (128GB)',
      price: 'R$ 799,00',
      numericPrice: 799.0,
      rating: 4.8,
      badge: 'Melhor Tela Super AMOLED',
      specs: ['Tela Super AMOLED 90Hz', '4GB RAM + 128GB', 'Bateria 5000mAh', 'Câmera 50MP + Ultra-Wide'],
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'prod_moto',
      name: 'Motorola Moto G54 5G',
      price: 'R$ 899,00',
      numericPrice: 899.0,
      rating: 4.6,
      badge: 'Conectividade 5G',
      specs: ['Processador 5G Dimensity 7020', '8GB RAM + 256GB', 'Som Dolby Atmos', 'Câmera 50MP OIS'],
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'prod_iphone',
      name: 'Apple iPhone 13 (128GB)',
      price: 'R$ 3.299,00',
      numericPrice: 3299.0,
      rating: 4.9,
      badge: 'Linha Premium',
      specs: ['Chip A15 Bionic', 'Super Retina XDR OLED', 'Gravação Modo Cinema 4K', 'iOS 18'],
      color: 'from-slate-600 to-slate-800',
    },
  ];

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.specs.some((s) => s.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleBuy = (productName: string, price: string) => {
    setCartCount((c) => c + 1);
    setNotification(`Pedido realizado para ${productName} (${price})!`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 pb-24 select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              data-morph-id="BUTTON_BACK_STORE"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              TechShop Mobile
            </h1>
            <p className="text-[11px] text-slate-400">Ofertas e comparação em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative p-2 rounded-xl bg-slate-800 border border-slate-700">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            data-morph-id="INPUT_STORE_FILTER"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar por marca, memória ou tela..."
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-4 max-w-lg mx-auto">
        {filtered.map((prod, idx) => (
          <div
            key={prod.id}
            data-product-card="true"
            className="p-4 rounded-2xl bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  {prod.badge}
                </span>
                <h2
                  data-product-name="true"
                  className="text-sm font-bold text-slate-100 mt-1"
                >
                  {prod.name}
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] text-slate-400 font-medium">{prod.rating} (avaliado por usuários)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preço à vista</span>
                <span
                  data-product-price="true"
                  className="text-base font-extrabold text-cyan-300"
                >
                  {prod.price}
                </span>
              </div>
            </div>

            {/* Specs badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {prod.specs.map((spec, sIdx) => (
                <span
                  key={sIdx}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-700"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" /> Em estoque (Frete grátis)
              </span>

              <button
                onClick={() => handleBuy(prod.name, prod.price)}
                data-morph-id={`BUTTON_BUY_${idx + 1}`}
                data-is-sensitive="true"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-900/30 active:scale-95 transition flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                Comprar Agora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
