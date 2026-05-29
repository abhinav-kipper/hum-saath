import Icon from './Icon';
import type { IconName } from '../types';

/* A rounded icon chip with a soft 3D fill. */
export default function Chip({
  icon,
  color,
  size = 48,
  r = 16,
}: {
  icon: IconName;
  color: string;
  size?: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        flex: '0 0 auto',
        background: color,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 7px 14px -7px rgba(90,60,30,.5)',
      }}
    >
      <Icon name={icon} size={size * 0.48} sw={2.2} color="#fff" />
    </div>
  );
}
