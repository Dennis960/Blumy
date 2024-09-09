import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("header-element")
export class HeaderElement extends LitElement {
    static styles = css`
        :host {
            width: 100%;
            font-size: 1.5rem;
            color: var(--text-light);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--primary-base);
            padding: 1.5rem 2rem;
            box-sizing: border-box;
        }
        span {
            text-shadow: 0 0 1px black;
        }
        .title {
            font-weight: 600;
        }
        header {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }

        .menu-icon {
            display: none;
            cursor: pointer;
            font-size: 2rem;
        }

        nav {
            display: flex;
            gap: 1.5rem;
            font-size: 1rem;
        }

        nav a {
            color: var(--text-light);
            text-decoration: none;
        }

        nav a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            :host {
                flex-direction: column;
                gap: 1rem;
            }
            .menu-icon {
                display: block;
            }

            nav {
                display: none;
                flex-direction: column;
                gap: 1rem;
                background-color: var(--primary-light);
                top: 100%;
                left: 0;
                width: 100%;
                padding: 1rem;
            }

            nav.show {
                display: flex;
            }
        }
    `;

    @property()
    title: string;

    @property()
    icon: string;

    @state()
    private menuOpen: boolean = false;

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    render() {
        return html`
            <header>
                <div class="title">
                    <span>${this.icon}</span>
                    <span>${this.title}</span>
                </div>
                <div class="menu-icon" @click="${this.toggleMenu}">☰</div>
            </header>
            <nav class="${this.menuOpen ? "show" : ""}">
                <a href="/">Setup</a>
                <a href="?page=update">Update</a>
                <a href="?page=sensor">Sensorwerte</a>
                <a href="?page=reset">Zurücksetzen</a>
            </nav>
        `;
    }
}
