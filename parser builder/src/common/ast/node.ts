import {PatternType} from "#common/patterns/index";

export class Field {
    identifier: string;
    field_pattern: PatternType;
    
    constructor(identifier: string,field_pattern: PatternType)
    {
        this.identifier = identifier;
        this.field_pattern = field_pattern;
    };
};

export class NodeDefinition {
    fields: Array<Field> = new Array<Field>();
    debug_name?: string;

    constructor(debug_name?: string)
    {
        if (!debug_name)
        {
            return;
        };
        this.debug_name = debug_name;
    };

    insert_field(field: Field): this
    {
        let has_field = this.fields.find((that_field) => {
            return that_field.identifier == field.identifier;
        });

        if (has_field)
        {
            throw new Error(
                `Field names can't repeat: ${field.identifier}`
            );
        };

        this.fields.push(field);
        return this;
    };
};

export type NodeID = number;

export class NodeRegistry {
    private readonly registry: Map<NodeID, NodeDefinition>;

    constructor() {
        this.registry = new Map<NodeID, NodeDefinition>();
    }

    /**
     * Registers an AST node definition bound to a specific NodeID.
     */
    public set(id: NodeID, definition: NodeDefinition): this {
        if (this.registry.has(id)) {
            throw new Error(`NodeID ${id} is already registered to '${this.registry.get(id)?.debug_name}'.`);
        }
        this.registry.set(id, definition);
        return this;
    }

    /**
     * Retrieves a NodeDefinition by its ID.
     */
    public get(id: NodeID): NodeDefinition | undefined {
        return this.registry.get(id);
    }

    /**
     * Checks if a NodeID is registered.
     */
    public has(id: NodeID): boolean {
        return this.registry.has(id);
    }

    public get_raw_map(): Map<NodeID, NodeDefinition> {
        return this.registry;
    }

    /**
     * Total number of registered nodes.
     */
    public get size(): number {
        return this.registry.size;
    }
}