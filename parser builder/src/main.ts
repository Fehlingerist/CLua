import { GeneratorContext, generate_parser_code } from "#common/emittion/generator";

import {Grammar,Nodes,Errors} from "#config/clua/index";

const clua_context = new GeneratorContext(Grammar.ScriptLanguageRoot)
    .set_node_definition(
        Grammar.ScriptLanguageRoot, 
        Nodes.NodeRegistry
    )
    .set_error_definition(
        Grammar.ScriptLanguageRoot,
        Errors.error_values_array
    );

generate_parser_code(clua_context);