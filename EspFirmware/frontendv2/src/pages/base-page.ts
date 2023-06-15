import { LitElement } from "lit";
import "./page-elements/button-element";
import "./page-elements/button-nav-element";
import "./page-elements/description-element";
import "./page-elements/error-text-element";
import "./page-elements/input-element";
import "./page-elements/progress-bar-element";
import "./page-elements/title-element";
import "./page-elements/wifi-list-element";
import "./page-elements/wifi-logo-element";
import "./page-elements/input-element-grid";

export class BasePage extends LitElement {
    /**
     * Changes to the previous page
     */
    back() {
        this.dispatchEvent(new CustomEvent("back"));
    }
    /**
     * Changes to the next page
     */
    next() {
        this.dispatchEvent(new CustomEvent("next"));
    }

    /**
     * Called once after firstUpdated() after the page has been painted
     */
    painted() {}

    firstUpdated() {
        // let the browser paint the page before calling painted()
        (async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
            this.painted();
        })();
    }
}
