export enum PatternYieldType {
    Invalid,
    None,
    NodeHandle,
    TokenSpanNode,
    Symbol,
    NodeChain
};

export type PatternType = PrimitivePattern;

abstract class BasePattern {
    recovery_pattern: PatternType | undefined;
    class_name: string;
    yield_type: PatternYieldType = PatternYieldType.None;

    constructor() {
        this.class_name = this.constructor.name;
    }

    get_yield_type(): PatternYieldType {
        return this.yield_type;
    };

    set_yield_type(yield_type: PatternYieldType) {
        this.yield_type = yield_type;
    };

    abstract get_children(): Array<PatternType>;

    set_pattern_name(pattern_name: string): this
    {
        this.class_name = pattern_name;
        return this;
    };

    get_pattern_name(): string
    {
        return this.class_name;
    };

    set_error_recovery_pattern(recovery_pattern: PatternType)
    {
        this.recovery_pattern = recovery_pattern;
    };
}

export abstract class PrimitivePattern extends BasePattern{
    error_id: number = -1;
    node_id: number = -1;

    get_children(): Array<PatternType> {
        return [];
    }

    with_error(error_id: number): this
    {
        this.error_id = error_id;
        return this;
    };

    yields_node(node_id: number): this
    {
        this.node_id = node_id;
        this.yield_type = PatternYieldType.NodeHandle;
        return this;
    };
};

export class LanguageRoot extends PrimitivePattern{
    root!: PatternType;
    language_name: string = "";

    constructor(language_name: string)
    {
        super();
        this.language_name = language_name;
    };

    get_children(): Array<PatternType> {
        return [this.root];
    }

    set_root(pattern: PatternType): this{
        this.root = pattern;
        return this;
    };

    get_root(): PatternType{
        if (this.root === undefined){
            throw new Error(
                `Root must be defined in ${this.language_name}`
            );
        };
        return this.root;
    };
};