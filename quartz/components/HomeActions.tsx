// @ts-ignore
import darkmodeScript from "./scripts/darkmode.inline"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const HomeActions: QuartzComponent = () => {
  return (
    <div class="home-actions" aria-label="home actions">
      <button class="darkmode home-action" aria-label="Toggle theme">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="dayIcon"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="nightIcon"
          aria-hidden="true"
        >
          <path d="M20.8 15.3A8.8 8.8 0 0 1 8.7 3.2 7.8 7.8 0 1 0 20.8 15.3Z" />
        </svg>
      </button>
      <a
        class="home-action"
        href="https://github.com/cmgzn"
        aria-label="GitHub"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.1 11.1.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.3 1.8 1.3 1.1 1.9 2.9 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.4-5.4-6A4.7 4.7 0 0 1 6.2 7c-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.3 1.3a11.1 11.1 0 0 1 6 0c2.3-1.6 3.3-1.3 3.3-1.3.6 1.7.2 3 .1 3.3a4.7 4.7 0 0 1 1.3 3.3c0 4.7-2.8 5.7-5.4 6 .5.4.9 1.2.9 2.4v3.6c0 .3.2.7.8.6a11.7 11.7 0 0 0 8-11.1A11.5 11.5 0 0 0 12 .5Z"
          />
        </svg>
      </a>
    </div>
  )
}

HomeActions.beforeDOMLoaded = darkmodeScript

export default (() => HomeActions) satisfies QuartzComponentConstructor
