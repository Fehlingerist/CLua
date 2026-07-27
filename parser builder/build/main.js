"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = require("#common/emittion/generator");
const index_1 = require("#config/clua/index");
const clua_context = new generator_1.GeneratorContext(index_1.Grammar.ScriptLanguageRoot)
    .set_node_definition(index_1.Grammar.ScriptLanguageRoot, index_1.Nodes.NodeRegistry)
    .set_error_definition(index_1.Grammar.ScriptLanguageRoot, index_1.Errors.error_values_array);
(0, generator_1.generate_parser_code)(clua_context).header_ir.print();
