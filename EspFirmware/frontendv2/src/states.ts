import { property, State } from "@lit-app/state";
import { Network } from "./api";

class CustomState<T> extends State {
    @property({ type: Object }) state: T = {} as T;
}

export const networkState = new CustomState<{
    network: Network;
    isConnected: boolean;
}>();

export const loadingState = new CustomState<boolean>();
