import { Subscription } from 'rxjs';
import { EventBus } from '../event/event-bus';
import AsyncLock from 'async-lock';
import { createClient, PolkadotClient, TypedApi } from 'polkadot-api';
import { polkadot } from '@polkadot-api/descriptors';
// import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { BlockInfo } from '@polkadot-api/observable-client';
import { Constants } from '../util/constants';
import { ChainSynthEvent } from '../event/event';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { NewFinalizedBlockEvent } from './types';
import { start } from 'polkadot-api/smoldot';
import { chainSpec } from 'polkadot-api/chains/polkadot';
import { getSmProvider } from 'polkadot-api/sm-provider';

interface DataStoreDelegate {}

class DataStore {
    private readonly eventBus = EventBus.getInstance();
    private readonly lock = new AsyncLock();
    private bestBlockSubscription?: Subscription = undefined;
    private finalizedBlockSubscription?: Subscription = undefined;
    private readonly bestBlockProcessLockKey = 'best_block_process';
    private readonly finalizedBlockProcessLockKey = 'finalized_block_process';
    private lastFinalizedBlock!: BlockInfo;

    private readonly smoldot = start();

    private jsAPI!: ApiPromise;
    private client!: PolkadotClient;
    private api!: TypedApi<typeof polkadot>;

    private delegate: DataStoreDelegate;

    constructor(delegate: DataStoreDelegate) {
        this.delegate = delegate;
    }

    async init() {
        //this.client = createClient(getWsProvider(Constants.POLKADOT_RPC_URL));
        //this.api = this.client.getTypedApi(polkadot);
        const wsProvider = new WsProvider(Constants.POLKADOT_RPC_URL);
        this.jsAPI = await ApiPromise.create({ provider: wsProvider });

        const chain = await this.smoldot.addChain({ chainSpec });
        this.client = createClient(getSmProvider(chain));
        this.api = this.client.getTypedApi(polkadot);
    }

    subscribe() {
        this.bestBlockSubscription = this.client.bestBlocks$.subscribe(
            async (blocks: BlockInfo[]) => {
                const bestBlock = blocks[0];
                const finalizedBlock = blocks[1];
                this.onBestBlock(bestBlock, finalizedBlock);
            },
        );
        this.finalizedBlockSubscription = this.client.finalizedBlock$.subscribe(
            async (block: BlockInfo) => {
                this.onFinalizedBlock(block);
            },
        );
    }

    async onBestBlock(bestBlock: BlockInfo, _finalizedBlock: BlockInfo) {
        this.lock.acquire(
            this.bestBlockProcessLockKey,
            (done) => {
                this.processBestBlock(bestBlock, done);
            },
            (error, _) => {
                if (error) {
                    console.error('Error while processing best block:', error);
                }
                // lock released
            },
        );
    }

    async processBestBlock(block: BlockInfo, done?: AsyncLock.AsyncLockDoneCallback<unknown>) {
        this.eventBus.dispatch<BlockInfo>(ChainSynthEvent.NEW_BEST_BLOCK, block);
        if (done) {
            done();
        }
    }

    async onFinalizedBlock(block: BlockInfo) {
        this.lastFinalizedBlock = block;
        this.lock.acquire(
            this.finalizedBlockProcessLockKey,
            (done) => {
                this.processFinalizedBlock(block, done);
            },
            (error, _) => {
                if (error) {
                    console.error('Error while processing finalized block:', error);
                }
                // lock released
            },
        );
    }

    async processFinalizedBlock(block: BlockInfo, done?: AsyncLock.AsyncLockDoneCallback<unknown>) {
        const jsAPIAt = await this.jsAPI.at(block.hash);
        const events = await jsAPIAt.query.system.events();
        const signedBlock = await this.jsAPI.rpc.chain.getBlock(block.hash);
        // @ts-expect-error non-error
        const eventCount = events.length;
        const extrinsicCount = signedBlock.block.extrinsics.length;
        this.eventBus.dispatch<NewFinalizedBlockEvent>(ChainSynthEvent.NEW_FINALIZED_BLOCK, {
            block,
            extrinsicCount,
            eventCount,
        });
        if (done) {
            done();
        }
    }
}

export { DataStore, DataStoreDelegate };
