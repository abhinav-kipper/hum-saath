import Jugnu from './Jugnu';

/* A small Jugnu drifting slowly behind the content. */
export default function AmbientJugnu() {
  return (
    <div className="firefly">
      <Jugnu size={34} mood="idle" />
    </div>
  );
}
