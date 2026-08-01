import logo from '../assets/logo.png'

export default function Logo({ size = 36 }) {
  return <img src={logo} width={size} height={size} alt="AutoSpark" className="shrink-0" />
}
