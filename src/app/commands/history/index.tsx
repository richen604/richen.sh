import { useAtomValue } from "jotai";
import { historyAtom } from "../../store";

export default function History() {
  const history = useAtomValue(historyAtom);
  return <ol aria-label="Command history">{history.map((line, index) =>
    <li key={index}><span className="text-accent">{index + 1}</span> {line}</li>)}</ol>;
}
