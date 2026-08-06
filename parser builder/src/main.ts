import { GeneratorContext, get_language_analysis } from "#common/generator";

import {ScriptLanguageRoot} from "#config/test_lang/grammar";

const clua_context = new GeneratorContext(ScriptLanguageRoot);

get_language_analysis(clua_context);
