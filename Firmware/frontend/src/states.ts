import { property, State } from "@lit-app/state";
import { Network } from "./api";

class CustomState<T> extends State {
    @property({ type: Object }) state: T;
    constructor(initialState: T) {
        super();
        this.state = initialState;
    }
}

export const networkState = new CustomState<
    | {
          network: Network | undefined;
          isConnected: boolean;
      }
    | undefined
>(undefined);

/**
 * state specifies the number of things that are currently loading.
 * If set to <=0, nothing is loading
 * If set to >0, something is loading
 */
export const loadingState = new CustomState<number>(0);

export const enableDotNavigation = new CustomState<boolean>(true);
