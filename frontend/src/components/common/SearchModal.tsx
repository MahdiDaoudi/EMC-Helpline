import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ShieldAlert, User, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignalementsService } from '../../services/signalements.service';
import { VictimsService } from '../../services/victims.service';
import type { Signalement, Victim } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [signalementsData, victimsData] = await Promise.all([
          SignalementsService.getSignalements({ limit: 5 }),
          VictimsService.getVictims(),
        ]);
        setSignalements(Array.isArray(signalementsData.items) ? signalementsData.items : []);
        setVictims(Array.isArray(victimsData) ? victimsData : []);
      } catch {
        setSignalements([]);
        setVictims([]);
      }
    };

    void loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items: Array<{ type: string; label: string; link: string; icon: typeof ShieldAlert }> = [];

    if (!normalized) {
      return items;
    }

    signalements.forEach((signalement) => {
      const label = `${signalement.reference ?? `SIG-${signalement.id}`} (${signalement.description ?? 'Signalement'})`;
      if (label.toLowerCase().includes(normalized)) {
        items.push({ type: 'Signalement', label, link: `/signalements/${signalement.id}`, icon: ShieldAlert });
      }
    });

    victims.forEach((victim) => {
      const label = `${victim.referenceNumber} (${victim.city ?? 'Ville inconnue'} - ${victim.sex})`;
      if (label.toLowerCase().includes(normalized)) {
        items.push({ type: 'Victim', label, link: '/victims', icon: User });
      }
    });

    items.push({
      type: 'Platform',
      label: 'Platform reports',
      link: '/platform-reports',
      icon: Globe,
    });

    return items;
  }, [query, signalements, victims]);

  const handleSelect = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-emc-border">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search signalements, reference codes, victims, platforms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg text-sm focus:outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((res, idx) => {
              const IconComp = res.icon;
              return (
                <button
                  key={`${res.type}-${idx}-${res.label}`}
                  onClick={() => handleSelect(res.link)}
                  className="w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-emc-elevated/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-emc-primary">{res.label}</p>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{res.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">No matching signalements or records found</div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-emc-surface/50 border-t border-slate-200 dark:border-emc-border flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-emc-elevated font-mono text-[10px]">ESC</kbd> to close
          </span>
          <span>Helpline Global Search</span>
        </div>
      </div>
    </div>
  );
};
