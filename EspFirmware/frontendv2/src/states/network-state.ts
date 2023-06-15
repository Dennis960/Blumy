import { State } from "@lit-app/state";
import { Network } from './api';

class NetworkState extends State {
    network: Network;
    isConnected: boolean;
}

export const networkState = new NetworkState();
