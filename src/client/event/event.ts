export abstract class ChainSynthEvent {
    static readonly NEW_BEST_BLOCK = 'event.new_best_block';
    static readonly NEW_FINALIZED_BLOCK = 'event.new_finalized_block';
    static readonly VOLUME_CHANGED = 'event.volume_changed';
    static readonly BASS_PARAMETERS_UPDATED = 'event.bass_parameters_updated';
    static readonly REACTOR_PARAMETERS_UPDATED = 'event.reactor_parameters_updated';
    static readonly MELODY_PARAMETERS_UPDATED = 'event.melody_parameters_updated';
    static readonly TRIGGER = 'event.trigger';
}
