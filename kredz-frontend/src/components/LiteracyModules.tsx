import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, X, Loader2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { joinKredzContract } from '../midnight/contract';
import { toast } from './Toast';

const MODULES = [
  { id: 'defi-mechanics', title: 'DeFi Mechanics', desc: 'Understand liquidity pools, AMMs, and yield farming fundamentals.', xp: 50,
    quiz: [
      { q: 'What does AMM stand for?', options: ['Automated Market Maker', 'Asset Management Module', 'Advanced Mining Method', 'Automated Money Market'], answer: 0 },
      { q: 'What is impermanent loss?', options: ['A permanent loss of funds', 'Loss from price divergence in liquidity pools', 'A tax on DeFi gains', 'Loss from gas fees'], answer: 1 },
      { q: 'What is a liquidity pool?', options: ['A savings account', 'A smart contract holding token pairs for trading', 'A mining pool', 'A cold wallet'], answer: 1 },
    ] },
  { id: 'risk-management', title: 'Risk Management', desc: 'Learn to assess and manage financial risk in DeFi protocols.', xp: 60,
    quiz: [
      { q: 'What is a smart contract audit?', options: ['A tax audit', 'A security review of contract code', 'A financial audit', 'A performance test'], answer: 1 },
      { q: 'What is collateralization ratio?', options: ['Loan-to-value ratio', 'Interest rate', 'Gas fee ratio', 'Token supply ratio'], answer: 0 },
      { q: 'What is liquidation in DeFi?', options: ['Selling all assets', 'Forced sale when collateral falls below threshold', 'Withdrawing liquidity', 'Burning tokens'], answer: 1 },
    ] },
  { id: 'zk-privacy-basics', title: 'ZK Privacy Basics', desc: 'Understand zero-knowledge proofs and how Midnight uses them.', xp: 70,
    quiz: [
      { q: 'What does ZK stand for?', options: ['Zero Knowledge', 'Zero Key', 'Zone Keeper', 'Zeta Kernel'], answer: 0 },
      { q: 'What can a ZK proof verify?', options: ['Nothing', 'A statement is true without revealing why', 'Only public data', 'Only on-chain data'], answer: 1 },
      { q: 'What is selective disclosure?', options: ['Sharing all data', 'Revealing only specific attributes while hiding others', 'Hiding all data', 'Public disclosure'], answer: 1 },
    ] },
  { id: 'midnight-ecosystem', title: 'Midnight Ecosystem', desc: 'Explore the Midnight blockchain, Compact language, and DPC model.', xp: 65,
    quiz: [
      { q: "What is Midnight's smart contract language?", options: ['Solidity', 'Rust', 'Compact', 'Move'], answer: 2 },
      { q: 'What does DPC stand for in Midnight?', options: ['Decentralized Private Computation', 'Digital Payment Chain', 'Distributed Proof Circuit', 'Dynamic Protocol Core'], answer: 0 },
      { q: 'Which wallet is used for Midnight?', options: ['MetaMask', 'Phantom', '1AM', 'Eternl'], answer: 2 },
    ] },
  { id: 'credit-fundamentals', title: 'Credit Fundamentals', desc: 'Learn traditional credit scoring concepts and how KREDZ adapts them.', xp: 45,
    quiz: [
      { q: 'What is a credit score?', options: ['A bank balance', 'A numerical rating of creditworthiness', 'A loan amount', 'An interest rate'], answer: 1 },
      { q: 'What improves a credit score?', options: ['Missing payments', 'High utilization', 'Consistent repayment history', 'Opening many accounts'], answer: 2 },
      { q: 'What is undercollateralized lending?', options: ['Lending with no collateral', 'Lending where collateral is less than loan value', 'Lending with excess collateral', 'Peer-to-peer lending'], answer: 1 },
    ] },
];

export function LiteracyModules() {
  const { wallet, contractAddress, completedModules, completeModule, layerScores, setLayerScores, score, setScore } = useApp();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const mod = MODULES.find(m => m.id === activeModule);

  function startModule(id: string) { setActiveModule(id); setCurrentQ(0); setSelected(null); setAnswers([]); setQuizDone(false); }

  function handleAnswer(idx: number) { if (selected !== null) return; setSelected(idx); }

  function nextQuestion() {
    if (selected === null || !mod) return;
    const correct = selected === mod.quiz[currentQ].answer;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (currentQ + 1 < mod.quiz.length) { setCurrentQ(q => q + 1); setSelected(null); }
    else { setQuizDone(true); }
  }

  async function claimXP() {
    if (!mod || !wallet || !contractAddress) return;
    setSubmitting(true);
    try {
      const api = await joinKredzContract(wallet, contractAddress);
      await api.updateScore(`module:${mod.id},xp:${mod.xp}`);
      completeModule(mod.id);
      const xpGain = Math.floor(mod.xp * (answers.filter(Boolean).length / answers.length));
      const newLayer3 = Math.min(layerScores[2] + xpGain, 200);
      setLayerScores([layerScores[0], layerScores[1], newLayer3]);
      setScore(score + xpGain);
      toast(`+${xpGain} XP earned! Layer 3 score updated on-chain.`, 'success');
      setActiveModule(null);
    } catch {
      toast('Failed to submit score. Please try again.', 'error');
    } finally { setSubmitting(false); }
  }

  const correctCount = answers.filter(Boolean).length;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {MODULES.map((mod, i) => {
          const done = completedModules.includes(mod.id);
          return (
            <motion.div key={mod.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-[#101010] rounded-2xl p-5 md:p-6 flex flex-col gap-3 transition-all cursor-pointer hover:bg-[#151515] ${done ? 'opacity-50' : ''}`}
              onClick={() => !done && startModule(mod.id)}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
                  {done ? <CheckCircle size={18} className="text-emerald-400" /> : <BookOpen size={18} className="text-[#DEDBC8]/60" />}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#DEDBC8]/10 text-[#DEDBC8]/70'}`}>
                  <Zap size={10} /> {mod.xp} XP
                </span>
              </div>
              <div>
                <h4 className="font-medium text-sm text-[#E1E0CC]">{mod.title}</h4>
                <p className="text-xs text-[#DEDBC8]/50 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
              <div className="mt-auto pt-2">
                {done
                  ? <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Completed</span>
                  : <span className="text-xs text-[#DEDBC8]/40">3 questions</span>
                }
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeModule && mod && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#101010] rounded-3xl p-8 max-w-lg w-full border border-[#DEDBC8]/5"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-lg text-[#E1E0CC]">{mod.title}</h3>
                  {!quizDone && <p className="text-xs text-[#DEDBC8]/40">Question {currentQ + 1} of {mod.quiz.length}</p>}
                </div>
                <button onClick={() => setActiveModule(null)} className="text-[#DEDBC8]/30 hover:text-[#DEDBC8]/70">
                  <X size={20} />
                </button>
              </div>

              {!quizDone ? (
                <>
                  <div className="w-full h-1 bg-[#DEDBC8]/5 rounded-full mb-6">
                    <div className="h-full bg-[#DEDBC8]/40 rounded-full transition-all"
                      style={{ width: `${((currentQ) / mod.quiz.length) * 100}%` }} />
                  </div>
                  <p className="font-medium text-[#E1E0CC] mb-5">{mod.quiz[currentQ].q}</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {mod.quiz[currentQ].options.map((opt, idx) => {
                      const isCorrect = idx === mod.quiz[currentQ].answer;
                      const isSelected = selected === idx;
                      let cls = 'bg-[#1A1A1A] rounded-xl px-4 py-3 text-sm text-left transition-all cursor-pointer ';
                      if (selected !== null) {
                        if (isCorrect) cls += 'border border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
                        else if (isSelected) cls += 'border border-red-500/30 bg-red-500/5 text-red-400';
                        else cls += 'opacity-30 text-[#DEDBC8]/50';
                      } else {
                        cls += 'hover:bg-[#222] text-[#DEDBC8]/80';
                      }
                      return <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>{opt}</button>;
                    })}
                  </div>
                  <button onClick={nextQuestion} disabled={selected === null}
                    className="w-full py-3 rounded-full bg-[#DEDBC8] text-black font-medium text-sm disabled:opacity-30 transition-all hover:gap-3">
                    {currentQ + 1 < mod.quiz.length ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-4">{correctCount === mod.quiz.length ? '🎉' : correctCount >= 2 ? '✅' : '📚'}</div>
                  <h4 className="font-medium text-2xl text-[#E1E0CC] mb-2">{correctCount}/{mod.quiz.length} Correct</h4>
                  <p className="text-sm text-[#DEDBC8]/50 mb-6">
                    You earned <span className="text-[#DEDBC8] font-semibold">{Math.floor(mod.xp * (correctCount / mod.quiz.length))} XP</span> - submitting to Midnight...
                  </p>
                  <button onClick={claimXP} disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#DEDBC8] text-black font-medium">
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting on-chain...</> : <><Zap size={16} /> Claim XP & Update Score</>}
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
