import { useState, useEffect, useRef, useCallback } from 'react';

interface Backspace {
  word: string;
  replacement: string;
}

interface TypewriterLine {
  text: string;
  pause?: number;
  backspaces?: Backspace[];
  speed?: number;
}

interface TypewriterSequenceProps {
  lines: TypewriterLine[];
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function TypewriterSequence({
  lines,
  className = '',
  cursorClassName = '',
  onComplete,
  autoStart = true,
}: TypewriterSequenceProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'backspacing' | 'retyping' | 'pausing' | 'done'>('typing');
  const [backspaceTarget, setBackspaceTarget] = useState('');
  const [backspaceReplacement, setBackspaceReplacement] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLine = lines[lineIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    if (phase === 'done') return;
    if (lineIndex >= lines.length) {
      setPhase('done');
      onComplete?.();
      return;
    }

    if (phase === 'pausing') {
      timerRef.current = setTimeout(() => {
        const next = lineIndex + 1;
        if (next >= lines.length) {
          setPhase('done');
          onComplete?.();
          return;
        }
        setLineIndex(next);
        setCharIndex(0);
        setDisplayedText('');
        setPhase('typing');
      }, currentLine.pause ?? 600);
      return;
    }

    if (phase === 'typing') {
      if (charIndex >= currentLine.text.length) {
        if (currentLine.backspaces && currentLine.backspaces.length > 0) {
          const bs = currentLine.backspaces[0];
          setBackspaceTarget(bs.word);
          setBackspaceReplacement(bs.replacement);
          setPhase('backspacing');
          setCharIndex(displayedText.length);
          return;
        }
        setPhase('pausing');
        return;
      }

      const speed = currentLine.speed ?? 45;
      timerRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + currentLine.text[charIndex]);
        setCharIndex(i => i + 1);
      }, speed);
      return;
    }

    if (phase === 'backspacing') {
      if (displayedText.endsWith(' ' + backspaceTarget) || displayedText === backspaceTarget) {
        const targetLen = backspaceTarget.length;
        if (charIndex > targetLen) {
          timerRef.current = setTimeout(() => {
            setDisplayedText(prev => prev.slice(0, -1));
            setCharIndex(i => i - 1);
          }, 40);
          return;
        }
        setPhase('retyping');
        setCharIndex(displayedText.length - targetLen);
        return;
      }
      setPhase('retyping');
      setCharIndex(displayedText.length - backspaceTarget.length);
      return;
    }

    if (phase === 'retyping') {
      const fullText = displayedText.slice(0, displayedText.lastIndexOf(backspaceTarget) + backspaceTarget.length);
      const beforeTarget = fullText.slice(0, -backspaceTarget.length);
      const target = beforeTarget + backspaceReplacement;
      if (charIndex >= target.length) {
        setPhase('pausing');
        return;
      }
      timerRef.current = setTimeout(() => {
        setDisplayedText(target.slice(0, charIndex + 1));
        setCharIndex(i => i + 1);
      }, 45);
      return;
    }

    return clearTimer;
  }, [autoStart, lineIndex, charIndex, phase, displayedText, lines, currentLine, backspaceTarget, backspaceReplacement, onComplete, clearTimer]);

  return (
    <p className={`relative inline ${className}`}>
      {displayedText}
      {phase !== 'done' && (
        <span className={`inline-block w-[2px] h-[1em] bg-current align-middle ml-0.5 ${cursorClassName}`}
          style={{ animation: 'blink-cursor 0.8s step-end infinite' }}
        />
      )}
    </p>
  );
}
