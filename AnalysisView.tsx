import React from 'react';
import { SecurityPlan } from '../types';
import { CheckCircle2, AlertTriangle, Cpu, DollarSign, Shield, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisViewProps {
  plan: SecurityPlan;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ plan, onReset }) => {
  
  // Prepare data for chart
  const chartData = plan.recommendations.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    cost: item.estimatedCost,
    fullname: item.name
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      
      {/* Executive Summary Section */}
      <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="text-blue-500" /> Security Assessment
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg mb-6">
              {plan.executiveSummary}
            </p>
            <div className="flex flex-wrap gap-2">
              {plan.vulnerabilities.map((vuln, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  <AlertTriangle className="w-3 h-3" />
                  {vuln}
                </span>
              ))}
            </div>
          </div>
          
          {/* Cost Card */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 min-w-[280px]">
            <p className="text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">Estimated Ecosystem Cost</p>
            <div className="flex items-baseline gap-1 text-3xl font-bold text-white mb-2">
              ${plan.totalEstimatedCostMin} <span className="text-slate-500 text-lg font-normal">-</span> ${plan.totalEstimatedCostMax}
            </div>
            <p className="text-xs text-slate-500 mb-4">Includes hardware estimates based on current market averages.</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              Export Bill of Materials
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Ecosystem & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Devices List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Cpu className="text-purple-400" /> Recommended Ecosystem
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.recommendations.map((device, idx) => (
              <div key={idx} className="group bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide
                      ${device.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        device.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                      {device.priority} Priority
                    </span>
                    <span className="text-slate-400 text-sm font-medium flex items-center">
                      <DollarSign className="w-3 h-3" />{device.estimatedCost}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-1">{device.name}</h4>
                  <p className="text-slate-400 text-sm mb-3">{device.description}</p>
                </div>
                <div className="mt-2 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-300 italic">
                    <span className="font-semibold text-purple-400 not-italic mr-1">Why:</span> 
                    {device.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Benefits & Chart */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`$${value}`, 'Cost']}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">System Benefits</h3>
            <ul className="space-y-3">
              {plan.ecosystemBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

           <button 
            onClick={onReset}
            className="w-full py-3 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            Start New Analysis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};