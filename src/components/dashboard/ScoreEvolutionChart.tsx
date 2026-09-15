// components/dashboard/ScoreEvolutionChart.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Calendar, Award, Target, Loader2, Brain, RefreshCw } from 'lucide-react';
import { useScoreEvolution } from '@/hooks/useScoreEvolution';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ScoreEvolutionChartProps {
  courseId?: string;
  className?: string;
  showStats?: boolean;
  title?: string;
}

export function ScoreEvolutionChart({ 
  courseId, 
  className,
  showStats = true,
  title = "Évolution des scores"
}: ScoreEvolutionChartProps) {
  const { data, loading, stats, getChartData, refresh } = useScoreEvolution(courseId);
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const chartData = getChartData(days);

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Chargement de votre progression...</p>
          </div>
        </div>
      </Card>
    );
  }

  const hasData = chartData.some(d => d.attempts > 0);

  // Calcul de la tendance
  const recentScores = chartData.filter(d => d.score > 0).map(d => d.score);
  const averageRecent = recentScores.length > 0 
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) 
    : 0;
  
  const firstScore = chartData.find(d => d.score > 0)?.score || 0;
  const lastScore = chartData[chartData.length - 1]?.score || 0;
  const progression = lastScore - firstScore;

  // Déterminer la couleur de progression
  const getProgressionColor = () => {
    if (progression > 10) return 'text-emerald-500';
    if (progression > 0) return 'text-emerald-400';
    if (progression < -10) return 'text-destructive';
    if (progression < 0) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Score:</span>
              <span className={cn(
                "font-bold",
                data.score >= 80 ? "text-emerald-500" :
                data.score >= 60 ? "text-amber-500" :
                "text-destructive"
              )}>
                {data.score}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Réussite:</span>
              <span className="font-bold text-purple-500">{data.successRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Exercices:</span>
              <span className="font-bold text-blue-500">{data.attempts}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 pt-1 border-t border-border/50">
              {data.fullDate}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!hasData) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Suivez votre progression</p>
          </div>
        </div>
        
        <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-purple-500/30 rounded-xl bg-gradient-to-b from-purple-500/5 to-pink-500/5">
          <Brain className="h-12 w-12 text-purple-500/30 mb-3" />
          <p className="text-base font-medium text-foreground mb-1">Aucune donnée disponible</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Commencez à faire des exercices pour voir votre progression apparaître ici.
          </p>
          <Button 
  onClick={refresh}
  variant="outline" 
  size="sm"
  className="mt-4 gap-2 border-purple-500/30 hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-colors"
>
  <RefreshCw className="h-4 w-4" />
  Actualiser
</Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      <Card className="p-6">
        {/* En-tête avec stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">Derniers {days} jours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sélecteur de type de graphique */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChartType('area')}
                className={cn(
                  "h-7 px-3 text-xs",
                  chartType === 'area' && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                Aire
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChartType('line')}
                className={cn(
                  "h-7 px-3 text-xs",
                  chartType === 'line' && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                Ligne
              </Button>
            </div>

            {/* Sélecteur de période */}
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDays(7)}
                className={cn(
                  "h-7 px-3 text-xs",
                  days === 7 && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                7j
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDays(30)}
                className={cn(
                  "h-7 px-3 text-xs",
                  days === 30 && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                30j
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDays(90)}
                className={cn(
                  "h-7 px-3 text-xs",
                  days === 90 && "bg-purple-500 text-white hover:bg-purple-600"
                )}
              >
                90j
              </Button>
            </div>

            {/* Bouton rafraîchir */}
           <Button
  size="sm"
  variant="ghost"
  onClick={refresh}
  className="h-7 w-7 p-0 ml-1 hover:bg-purple-500 hover:text-white"
  title="Rafraîchir"
>
  <RefreshCw className="h-3.5 w-3.5" />
</Button>
          </div>
        </div>

        {/* Graphique */}
       <div className="w-full" style={{ height: 256, minHeight: 256 }}>
  <ResponsiveContainer width="100%" height={256}>
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label="Objectif" />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label="Alerte" />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#8b5cf6" }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Score quotidien</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-500" />
            <span>Objectif (70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive" />
            <span>Alerte (40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>≥80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>&lt;60%</span>
          </div>
        </div>
      </Card>

      {/* Statistiques détaillées */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Total exercices</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalAttempts}</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Moyenne</p>
            <p className="text-2xl font-bold text-purple-500">{stats.averageScore}%</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Meilleur score</p>
            <p className="text-2xl font-bold text-emerald-500">{stats.bestScore}%</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Série actuelle</p>
            <p className="text-2xl font-bold text-amber-500">{stats.streak}</p>
          </Card>
        </div>
      )}

      {/* Résumé de la progression */}
      {progression !== 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-foreground">Progression</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {firstScore}% → {lastScore}%
              </span>
              <span className={cn(
                "text-sm font-bold",
                getProgressionColor()
              )}>
                {progression > 0 ? '+' : ''}{progression}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}