import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressChartsProps {
  weeklyData?: number[];
  monthlyProgress?: number;
  masteryDistribution?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export function ProgressCharts({ 
  weeklyData = [30, 45, 60, 55, 70, 65, 80],
  monthlyProgress = 42,
  masteryDistribution = { beginner: 3, intermediate: 5, advanced: 2 }
}: ProgressChartsProps) {
  const maxValue = Math.max(...weeklyData);
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">📈 Mes statistiques</h2>
          <p className="text-sm text-muted-foreground">Suis ta progression au fil du temps</p>
        </div>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique de progression hebdomadaire */}
        <div className="card-elevated p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Progression cette semaine</h3>
              <p className="text-sm text-muted-foreground">% d'exercices réussis</p>
            </div>
            <div className="text-2xl font-bold text-primary">{weeklyData[weeklyData.length - 1]}%</div>
          </div>
          
          <div className="h-48 relative">
            {/* Lignes de grille */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 25, 50, 75, 100].map((value, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-8 text-xs text-muted-foreground text-right pr-2">{value}%</div>
                  <div className="flex-1 h-px bg-border" />
                </div>
              ))}
            </div>
            
            {/* Graphique */}
            <div className="absolute inset-0 pl-8 flex items-end justify-between pt-4 pb-6">
              {weeklyData.map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1 px-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxValue) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className={`w-6 rounded-t-lg ${
                      index === weeklyData.length - 1 
                        ? 'bg-gradient-to-t from-primary to-primary/80' 
                        : 'bg-gradient-to-t from-muted-foreground/30 to-muted-foreground/20'
                    }`}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index]}
                  </span>
                  <span className="text-xs font-semibold text-foreground mt-1">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Progression mensuelle */}
        <div className="card-elevated p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Objectif mensuel</h3>
              <p className="text-sm text-muted-foreground">Cours maîtrisés</p>
            </div>
            <Target className="w-5 h-5 text-accent" />
          </div>
          
          <div className="flex flex-col items-center justify-center h-48">
            <div className="relative w-48 h-48 -mt-8">
              {/* Cercle de progression */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-muted"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${monthlyProgress * 2.83} 283`}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (monthlyProgress * 2.83) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary"
                />
              </svg>
              
              {/* Texte au centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{monthlyProgress}%</span>
                <span className="text-sm text-muted-foreground">Complété</span>
                <div className="mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  +{monthlyProgress - 30}% vs dernier mois
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Distribution des niveaux */}
        <div className="card-elevated p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Niveau de maîtrise</h3>
              <p className="text-sm text-muted-foreground">Répartition de tes cours</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="h-48">
            {/* Graphique en barres */}
            <div className="flex items-end h-32 gap-3 mt-4">
              {Object.entries(masteryDistribution).map(([level, count], index) => {
                const total = Object.values(masteryDistribution).reduce((a, b) => a + b, 0);
                const height = total > 0 ? (count / total) * 100 : 0;
                const colors = {
                  beginner: 'from-blue-500 to-cyan-500',
                  intermediate: 'from-purple-500 to-pink-500',
                  advanced: 'from-emerald-500 to-teal-500',
                };
                const labels = {
                  beginner: 'Débutant',
                  intermediate: 'Intermédiaire',
                  advanced: 'Avancé',
                };
                
                return (
                  <div key={level} className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.2, duration: 1 }}
                      className={`w-full rounded-lg bg-gradient-to-t ${colors[level as keyof typeof colors]}`}
                    />
                    <span className="text-xs font-semibold text-foreground mt-2">
                      {labels[level as keyof typeof labels]}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {count} cours
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Légende */}
            <div className="flex justify-center gap-4 mt-6">
              {Object.entries(masteryDistribution).map(([level, count]) => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    level === 'beginner' ? 'bg-blue-500' :
                    level === 'intermediate' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-xs text-muted-foreground capitalize">{level}</span>
                  <span className="text-xs font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}