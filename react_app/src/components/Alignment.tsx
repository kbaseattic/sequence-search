import { Card } from 'antd';
import React, { FC } from 'react';
import './Alignment.css';

interface AlignmentProps {
  querySeq: string
  queryStart: number
  targetSeq: string
  targetStart: number
}

export const Alignment: FC<AlignmentProps> = ({ querySeq, queryStart, targetSeq, targetStart }) => {

  const q = Array.from(querySeq);
  const t = Array.from(targetSeq);

  if (q.length !== t.length) throw new Error('Alignment length mismatch');

  const alignment = (i: number) => {
    if (q[i] === t[i]) return "match"
    else if (q[i] === '-' || t[i] === '-') return "gap"
    else return "mismatch"
  }

  const a = q.map((_, i) => alignment(i) === "match" ? "|" : "\xa0");

  return (
    <Card size="small" bodyStyle={{ padding: 0 }}>
      <div className="Alignment">
        <div className="Alignment__label">
          <div>Query</div>
          <div>&nbsp;</div>
          <div>Target</div>
        </div>
        <div className="Alignment__label">
          <div>{queryStart}</div>
          <div>&nbsp;</div>
          <div>{targetStart}</div>
        </div>
        <div className="Alignment__seq-wrapper">
          <div className="Alignment__seq">
            {q.map((qVal, i) => {
              const c = `Alignment__seq-val Alignment__seq-val--${alignment(i)}`
              return <span className={c}>{qVal}</span>
            })}
          </div>
          <div className="Alignment__seq">
            {a.map((aVal, i) => {
              const c = `Alignment__seq-val Alignment__seq-val--${alignment(i)}`
              return <span className={c}>{aVal}</span>
            })}
          </div>
          <div className="Alignment__seq">
            {t.map((tVal, i) => {
              const c = `Alignment__seq-val Alignment__seq-val--${alignment(i)}`
              return <span className={c}>{tVal}</span>
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}