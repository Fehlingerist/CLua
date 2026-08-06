"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = require("#common/emittion/generator");
const grammar_1 = require("#config/test_lang/grammar");
const clua_context = new generator_1.GeneratorContext(grammar_1.ScriptLanguageRoot);
(0, generator_1.get_language_analysis)(clua_context);
