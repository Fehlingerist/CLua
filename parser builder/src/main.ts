import { GeneratorContext, get_language_analysis} from "#common/emittion/generator";

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

get_language_analysis(clua_context);