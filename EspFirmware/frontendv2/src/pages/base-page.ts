import { LitElement } from "lit-element";
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
    next(data?: any) {
        this.dispatchEvent(new CustomEvent("next", { detail: data }));
    }
}
