export default function WordText({text}:{text:string}) {
  return <span className="word-text">{text.split(/(\s+)/).map((word,i)=>/\s/.test(word)?word:<span className="word-clip" key={i}><span className="reveal-word">{word}</span></span>)}</span>;
}
