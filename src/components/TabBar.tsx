import Icon from './Icon';
import { useApp, type Route } from '../context/AppContext';
import type { IconName } from '../types';

const ITEMS: [Route, string, IconName][] = [
  ['home', 'होम', 'home'],
  ['exercise', 'व्यायाम', 'activity'],
  ['meds', 'दवाई', 'pill'],
  ['dash', 'रिपोर्ट', 'chart'],
  ['lessons', 'सीखें', 'book'],
];

export default function TabBar() {
  const { route, nav } = useApp();
  return (
    <nav className="tabbar glass" aria-label="Main">
      {ITEMS.map(([id, lbl, ic]) => {
        const on = route === id;
        return (
          <button key={id} type="button" className={`tab ${on ? 'on' : ''}`} onClick={() => nav(id)}>
            <Icon name={ic} size={23} sw={on ? 2.5 : 2} />
            <span className="lbl">{lbl}</span>
            <span className="tabdot" />
          </button>
        );
      })}
    </nav>
  );
}
