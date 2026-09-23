import { useT } from '../store/lang'

/**
 * Donation links, the same three the other trackers carry and in the same order.
 *
 * They open in a new tab. Nothing is collected or proxied by the app itself — there is no
 * backend that could, and adding one for a donate button would break the app's first rule.
 */

const LINKS = [
  { url: 'https://buymeacoffee.com/ipupok', label: 'Buy Me a Coffee', Icon: CoffeeIcon },
  { url: 'https://ko-fi.com/ipupok', label: 'Ko-fi', Icon: KofiIcon },
  {
    url: 'https://www.paypal.com/donate/?hosted_button_id=VBNDB5AHYLGCY',
    label: 'PayPal',
    Icon: PaypalIcon,
  },
]

function CoffeeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 9h13v6.5a4.5 4.5 0 0 1-4.5 4.5h-4A4.5 4.5 0 0 1 4 15.5z" strokeLinejoin="round" />
      <path d="M17 10.5h1.8a2.7 2.7 0 0 1 0 5.4H17" strokeLinejoin="round" />
      <path d="M7.5 3v2.5M11 3v2.5M14.5 3v2.5" strokeLinecap="round" />
    </svg>
  )
}

function KofiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M3.5 7h13v7a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5z" strokeLinejoin="round" />
      <path d="M16.5 8.5h2a2.6 2.6 0 0 1 0 5.2h-2" strokeLinejoin="round" />
      <path
        d="M8 12.2c0-1 .8-1.7 1.6-1.3.3.2.4.5.4.5s.1-.3.4-.5c.8-.4 1.6.3 1.6 1.3 0 1.2-2 2.3-2 2.3s-2-1.1-2-2.3z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function PaypalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path
        d="M6.8 19.5 8.9 5.2h5.2c2.5 0 4 1.4 3.6 3.7-.4 2.5-2.3 3.9-5 3.9h-2l-.9 6.7z"
        strokeLinejoin="round"
      />
      <path d="M10 12.8h2.3c2.4 0 4 1.2 3.6 3.4-.3 2.2-2 3.3-4.4 3.3H9.4" strokeLinejoin="round" />
    </svg>
  )
}

export function SupportLinks() {
  const t = useT()
  return (
    <section className="card">
      <h2 className="card-head">{t('support_title')}</h2>
      <p className="card-note">{t('support_note')}</p>
      <div className="support-links">
        {LINKS.map(({ url, label, Icon }) => (
          <a
            key={url}
            className="support-link"
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            title={label}
          >
            <Icon />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
