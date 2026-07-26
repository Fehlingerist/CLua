import { LanguageRoot } from "#common/patterns/index";
import { NodeRegistry} from "#common/ast/node";
import { PrimitivePattern, MatchSymbolPattern } from "#common/patterns/index";
import { ErrorDefinitionList } from "#common/ast/error";
import { warn } from "node:console";

/* 
    Generator converts patterns into a mega parser file.

    Generator disambiguates programming languages with help 
    of grammar specification language, it determines to which language 
    does the symbol belong to and warns about ambiguities in the language.

    Later it should resolve at which points do the patterns stop overlapping.
*/

export class GeneratorContext {
  main_root: LanguageRoot;
  node_definitions: Map<LanguageRoot,NodeRegistry>;
  error_definition_list: Map<LanguageRoot,ErrorDefinitionList>;

  constructor(root: LanguageRoot)
  {
    this.main_root = root;
    this.node_definitions = new Map<LanguageRoot,NodeRegistry>();
    this.error_definition_list = new Map<LanguageRoot,ErrorDefinitionList>();
  };

  set_node_definition(language: LanguageRoot,node_definitions: NodeRegistry): this
  {
    this.node_definitions.set(language,node_definitions);
    return this;
  };

  set_error_definition(language: LanguageRoot,error_definition_list: ErrorDefinitionList): this
  {
    this.error_definition_list.set(language,error_definition_list);
    return this;
  };
};

export class GenerationInfo {
  hardened_symbols: Array<MatchSymbolPattern> = new Array<MatchSymbolPattern>();
  symbol_map: Map<string,MatchSymbolPattern> = new Map<string,MatchSymbolPattern>();

  error_codes: Map<LanguageRoot, ErrorDefinitionList>;
  used_error_codes: Map<LanguageRoot,Array<boolean>>;

  not_all_error_codes_used: boolean = true;

  constructor(generator_context: GeneratorContext)
  { 
    this.error_codes = generator_context.error_definition_list;
    this.used_error_codes = new Map<LanguageRoot,Array<boolean>>();
    this.error_codes.forEach((value,key) => {
      this.used_error_codes
      .set(key,new Array<boolean>(value.length)
      .fill(false))
    });
  };

  display_info()
  {
    console.log(this);
  };
};

export class GeneratedFiles {
  generation_info: GenerationInfo

  parser_header: string;
  parser_implementation: string;

  constructor(generator_context: GeneratorContext)
  {
    this.generation_info = new GenerationInfo(generator_context);
    this.parser_header = "";
    this.parser_implementation = "";
  };
};

export function generate_parser_code(generator_context: GeneratorContext): GeneratedFiles {
  let generated_files = new GeneratedFiles(generator_context);
  let generation_info = generated_files.generation_info;
  let hardened_symbols = generation_info.hardened_symbols;
  let symbol_map = generation_info.symbol_map;

  // Track patterns we have already visited to prevent infinite loops in cyclic grammars
  const visited_patterns = new Set<PrimitivePattern>();

  /* 
    1. Define the Recursive Grammar Walker
  */
  function walk_grammar_pattern(pattern: PrimitivePattern, current_language: LanguageRoot) {
    if (!pattern || visited_patterns.has(pattern)) return;
    visited_patterns.add(pattern);

    // Track Error Code Usage
    // (Assuming pattern has an error property or internal ID from .with_error())
    if (pattern.error_id !== undefined && pattern.error_id !== -1) {
      const used_flags = generation_info.used_error_codes.get(current_language);
      if (used_flags && pattern.error_id < used_flags.length) {
        used_flags[pattern.error_id] = true;
      }
    }

    if (pattern instanceof LanguageRoot)
    {
      for (const starting_pattern of generator_context.main_root.root.get_children()) {
        walk_grammar_pattern(starting_pattern, pattern);
      }
    }else if (pattern instanceof MatchSymbolPattern) {
      const literal = pattern.expected_symbol;

      // Handle Hardened Symbols
      if (pattern.is_hardset_symbol) {
        if (!hardened_symbols.includes(pattern)) {
          hardened_symbols.push(pattern);
        }
      }

      // Check for structural ambiguities (Same literal, different symbol labels)
      if (symbol_map.has(literal)) {
        const existing_pattern = symbol_map.get(literal)!;
        if (existing_pattern.symbol_label !== pattern.symbol_label) {
          warn(
            `Grammar Ambiguity Warning: The symbol text "${literal}" is registered under ` +
            `multiple labels: "${existing_pattern.symbol_label}" and "${pattern.symbol_label}".`
          );
        }
      } else {
        symbol_map.set(literal, pattern);
      }
    }
    else {
      const children = pattern.get_children();
      for (const child of children) {
        walk_grammar_pattern(child, current_language);
      }
    }
  }

  /* 
    2. Start Traversal from the Main Root
  */
  if (generator_context.main_root) {
    for (const starting_pattern of generator_context.main_root.root.get_children()) {
      walk_grammar_pattern(starting_pattern, generator_context.main_root);
    }
  }

  /* 
    3. Finalize Error Code Check Metrics
  */
  let all_errors_used = true;
  generation_info.used_error_codes.forEach((flags) => {
    if (flags.includes(false)) {
      all_errors_used = false;
    }
  });
  generation_info.not_all_error_codes_used = !all_errors_used;

  generation_info.display_info();

  return generated_files;
}
