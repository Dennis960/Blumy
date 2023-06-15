import { State } from "@lit-app/state";
import { Network } from './api';

class NetworkState extends State {
    network: Network;
}

export const networkState = new NetworkState();
