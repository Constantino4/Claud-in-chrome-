import React, { useState, useEffect, useRef } from 'react';
import { Globe, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { tabManager } from '../../services/TabManager';

interface WebProxyPageProps {
  url: string;
  onNavigate?: (url: string) => void;
}

export const WebProxyPage: React.FC<WebProxyPageProps> = ({ url, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
    setHasError(false);
  }, [url]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MORPH_NAVIGATE' && event.data.url) {
        if (onNavigate) {
          onNavigate(event.data.url);
        } else {
          tabManager.updateActiveTabUrl(event.data.url);
        }
      }
      if (event.data?.type === 'MORPH_PAGE_LOADED') {
        setLoading(false);
        if (event.data.title) {
          tabManager.setTabTitle(tabManager.getActiveTabId(), event.data.title);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  const proxySrc = `/api/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="w-full h-full relative bg-slate-950 flex flex-col">
      {/* Top Mini-Bar for external site feedback */}
      <div className="h-7 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
          <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate font-mono text-[10px] text-slate-300">{url}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setHasError(false);
              if (iframeRef.current) {
                iframeRef.current.src = proxySrc;
              }
            }}
            title="Recarregar"
            className="hover:text-cyan-300 transition"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir em nova aba"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 text-[10px] font-semibold"
          >
            Abrir fora <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 top-7 bg-slate-950/85 z-10 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-300">Navegando com Morph Proxy em {url}...</span>
        </div>
      )}

      {hasError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-100">Página Web Carregada</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            O site <span className="font-mono text-cyan-400">{url}</span> restringe visualização embutida por políticas de segurança.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition"
            >
              Abrir externamente <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={proxySrc}
          title={url}
          className="w-full flex-1 border-0 bg-slate-900"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          onLoad={() => {
            setLoading(false);
            try {
              if (iframeRef.current?.contentDocument) {
                const doc = iframeRef.current.contentDocument;
                if (doc.title) {
                  tabManager.setTabTitle(tabManager.getActiveTabId(), doc.title);
                }
              }
            } catch (e) {
              // Ignore cross-origin read error if any
            }
          }}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};
