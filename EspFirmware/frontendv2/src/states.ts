import { property, State } from "@lit-app/state";
import { Network } from "./api";

class CustomState<T> extends State {
    @property({ type: Object }) state: T;
    constructor(initialState?: T) {
        super();
        this.state = initialState;
    }
}

export const networkState = new CustomState<{
    network: Network;
    isConnected: boolean;
}>({} as any);

export const loadingState = new CustomState<boolean>();
