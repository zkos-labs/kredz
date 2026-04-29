import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, X, Loader2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { joinKredzContract } from '../midnight/contract';
import { toast } from './Toast';

const MODULES = [
  {
    id: 'defi-mechanics',
    title: 'DeFi Mechanics',
    desc: 'Understand liquidity pools, AMMs, and yield farming fundamentals.',
    xp: 50,
    quiz: [
      { q: 'What does AMM stand for?', options: ['Automated Market Maker', 'Asset Management Module', 'Advanced Mining Method', 'Automated Money Market'], answer: 0 },
      { q: 'What is impermanent loss?', options: ['A permanent loss of funds', 'Loss from price divergence in liquidity pools', 'A tax on DeFi gains', 'Loss from gas fees'], answer: 1 },
      { q: 'What is a liquidity pool?', options: ['A savings account', 'A smart contract holding token pairs for trading', 'A mining pool', 'A cold wallet'], answer: 1 },
    ],
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    desc: 'Learn to assess and manage financial risk in DeFi protocols.',
    xp: 60,
    quiz: [
      { q: 'What is a smart contract audit?', options: ['A tax audit', 'A security review of contract code', 'A financial audit', 'A performance test'], answer: 1 },
      { q: 'What is collateralization ratio?', options: ['Loan-to-value ratio', 'Interest rate', 'Gas fee ratio', 'Token supply ratio'], answer: 0 },
      { q: 'What is liquidation in DeFi?', options: ['Selling all assets', 'Forced sale when collateral falls below threshold', 'Withdrawing liquidity', 'Burning tokens'], answer: 1 },
    ],
  },
  {
    id: 'zk-privacy-basics',
    title: 'ZK Privacy Basics',
    desc: 'Understand zero-knowledge proofs and how Midnight uses them.',
    xp: 70,
    quiz: [
      { q: 'What does ZK stand for?', options: ['Zero Knowledge', 'Zero Key', 'Zone Keeper', 'Zeta Kernel'], answer: 0 },
      { q: 'What can a ZK proof verify?', options: ['Nothing', 'A statement is true without revealing why', 'Only public data', 'Only on-chain data'], answer: 1 },
      { q: 'What is selective disclosure?', options: ['Sharing all data', 'Revealing only specific attributes while hiding others', 'Hiding all data', 'Public disclosure'], answer: 1 },
    ],
  },
  {
    id: 'midnight-ecosystem',
    title: 'Midnight Ecosystem',
    desc: 'Explore the Midnight blockchain, Compact language, and DPC model.',
    xp: 65,
    quiz: [
      { q: 'What is Midnight\'s smart contract language?', options: ['Solidity', 'Rust', 'Compact', 'Move'], answer: 2 },
      { q: 'What does DPC stand for in Midnight?', options: ['Decentralized Private Computation', 'Digital Payment Chain', 'Distributed Proof Circuit', 'Dynamic Protocol Core'], answer: 0 },
      { q: 'Which wallet is used for Midnight?', options: ['MetaMask', 'Phantom', 'Lace Beta', 'Eternl'], answer: 2 },
    ],
  },
  {
    id: 'credit-fundamentals',
    title: 'Credit Fundamentals',
    desc: 'Learn traditional credit scoring concepts and how KREDZ adapts them.',
    xp: 45,
    quiz: [
      { q: 'What is a credit score?', options: ['A bank balance', 'A numerical rating of creditworthiness', 'A loan amount', 'An interest rate'], answer: 1 },
      { q: 'What improves a credit score?', options: ['Missing payments', 'High utilization', 'Consistent repayment history', 'Opening many accounts'], answer: 2 },
      { q: 'What is undercollateralized lending?', options: ['Lending with no collateral', 'Lending where collateral is less than loan value', 'Lending with excess collateral', 'Peer-to-peer lending'], answer: 1 },
    ],
  },
];

export function LiteracyModules() {
  const { wallet, contractAddress, completedModules, completeModule, layerScores, setLayerScores, score, setScore } = useApp();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const module = MODULES.find(m => m.id === activeModule);

  function startModule(id: string) {
    setActiveModule(id);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setQuizDone(false);
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function nextQuestion() {
    if (selected === null || !module) return;
    const correct = selected === module.quiz[currentQ].answer;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (currentQ + 1 < module.quiz.length) {
      setCurrentQ(q => q + 1);
      setSelected(null);
    } else {
      setQuizDone(true);
    }
  }

  async function claimXP() {
    if (!module || !wallet || !contractAddress) return;
    setSubmitting(true);
    try {
      const api = await joinKredzContract(wallet, contractAddress);
      await api.updateScore(`module:${module.id},xp:${module.xp}`);
      completeModule(module.id);

      // Update layer 3 score
      const xpGain = Math.floor(module.xp * (answers.filter(Boolean).length / answers.length));
      const newLayer3 = Math.min(layerScores[2] + xpGain, 200);
      const newLayers: [number, number, number] = [layerScores[0], layerScores[1], newLayer3];
      setLayerScores(newLayers);
      setScore(score + xpGain);

      toast(`+${xpGain} XP earned! Layer 3 score updated on-chain.`, 'success');
      setActiveModule(null);
    } catch {
      toast('Failed to submit score. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const correctCount = answers.filter(Boolean).length;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod, i) => {
          const done = completedModules.includes(mod.id);
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass rounded-2xl p-6 flex flex-col gap-3 transition-all ${done ? 'opacity-70' : 'hover:border-accent/30 hover:scale-[1.02] cursor-pointer'}`}
              onClick={() => !done && startModule(mod.id)}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center">
                  {done ? <CheckCircle size={18} className="text-green-400" /> : <BookOpen size={18} className="text-gold" />}
                </div>
                <span className={`text-xs font-inter font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${done ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-gold'}`}>
                  <Zap size={10} />
                  {mod.xp} XP
                </span>
              </div>
              <div>
                <h4 className="font-manrope font-bold text-light text-sm">{mod.title}</h4>
                <p className="font-inter text-xs text-light/50 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="mt-auto pt-2">
                {done ? (
                  <span className="text-xs font-inter text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Completed
                  </span>
                ) : (
                  <span className="text-xs font-inter text-accent">3 questions →</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeModule && module && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-manrope font-bold text-light text-lg">{module.title}</h3>
                  {!quizDone && <p className="font-inter text-xs text-light/40">Question {currentQ + 1} of {module.quiz.length}</p>}
                </div>
                <button onClick={() => setActiveModule(null)} className="text-light/40 hover:text-light/70">
                  <X size={20} />
                </button>
              </div>

              {!quizDone ? (
                <>
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-light/10 rounded-full mb-6">
                    <div className="h-full bg-gradient-to-r from-accent to-gold rounded-full transition-all"
                      style={{ width: `${((currentQ) / module.quiz.length) * 100}%` }} />
                  </div>

                  <p className="font-manrope font-semibold text-light mb-5">{module.quiz[currentQ].q}</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {module.quiz[currentQ].options.map((opt, idx) => {
                      const isCorrect = idx === module.quiz[currentQ].answer;
                      const isSelected = selected === idx;
                      let cls = 'glass rounded-xl px-4 py-3 text-sm font-inter text-left transition-all cursor-pointer ';
                      if (selected !== null) {
                        if (isCorrect) cls += 'border-green-500/50 bg-green-500/10 text-green-300';
                        else if (isSelected) cls += 'border-red-500/50 bg-red-500/10 text-red-300';
                        else cls += 'opacity-40 text-light/50';
                      } else {
                        cls += 'hover:border-accent/40 text-light/80';
                      }
                      return (
                        <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={nextQuestion}
                    disabled={selected === null}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold text-sm disabled:opacity-40 transition-all hover:scale-[1.02]"
                  >
                    {currentQ + 1 < module.quiz.length ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-4">{correctCount === module.quiz.length ? '🎉' : correctCount >= 2 ? '✅' : '📚'}</div>
                  <h4 className="font-manrope font-bold text-2xl text-light mb-2">
                    {correctCount}/{module.quiz.length} Correct
                  </h4>
                  <p className="font-inter text-sm text-light/50 mb-6">
                    You earned <span className="text-gold font-semibold">{Math.floor(module.xp * (correctCount / module.quiz.length))} XP</span> — submitting to Midnight…
                  </p>
                  <button
                    onClick={claimXP}
                    disabled={submitting}
                    className="glow-btn w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold"
                  >
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting on-chain…</> : <><Zap size={16} /> Claim XP & Update Score</>}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
