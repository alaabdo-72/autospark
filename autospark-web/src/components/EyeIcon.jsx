export default function EyeIcon({ visible }) {
  return visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="#8b95a1"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#8b95a1" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.6 6.7C4.3 8.2 2.7 10.3 2 12c0 0 3.6 7 10 7 2 0 3.7-.5 5.1-1.3M9.9 4.2C10.6 4.1 11.3 4 12 4c6.4 0 10 7 10 7-.4.8-1.2 2-2.4 3.2"
        stroke="#8b95a1"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
