'use client';

import { useEffect, useId } from 'react';
import { useTranslations } from 'next-intl';
import { useCalculatorStore, useLoadAgents } from '@/lib/store';

interface AgentSelectorProps {
  disabled?: boolean;
}

export function AgentSelector({ disabled = false }: AgentSelectorProps) {
  const t = useTranslations();
  const id = useId();
  const { loadAgents } = useLoadAgents();
  const { agents, agentsLoading, selectedAgent, setSelectedAgent } = useCalculatorStore();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleChange = (agentId: string) => {
    if (agentId === '') {
      setSelectedAgent(null);
    } else {
      const agent = agents.find((a) => a.id === agentId);
      setSelectedAgent(agent || null);
    }
  };

  // Don't render if no agents available
  if (!agentsLoading && agents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {t('calculator.partnerAgent')}
      </label>

      <div className="relative">
        <select
          id={id}
          value={selectedAgent?.id ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled || agentsLoading}
          className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800
            transition-colors focus:outline-none focus:ring-2
            border-slate-300 focus:border-blue-500 focus:ring-blue-200
            ${disabled || agentsLoading ? 'cursor-not-allowed bg-slate-100' : ''}
          `}
        >
          <option value="">{t('calculator.noAgentSelected')}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}{agent.company ? ` - ${agent.company}` : ''}
            </option>
          ))}
        </select>

        {agentsLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
          </div>
        )}
      </div>

      {selectedAgent && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            {selectedAgent.headshotUrl && (
              <img
                src={selectedAgent.headshotUrl}
                alt={selectedAgent.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {selectedAgent.name}
              </p>
              {selectedAgent.company && (
                <p className="text-xs text-slate-600 truncate">{selectedAgent.company}</p>
              )}
              {selectedAgent.email && (
                <p className="text-xs text-slate-500 truncate">{selectedAgent.email}</p>
              )}
              {selectedAgent.phone && (
                <p className="text-xs text-slate-500">{selectedAgent.phone}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        {t('calculator.agentCobrandingNote')}
      </p>
    </div>
  );
}
